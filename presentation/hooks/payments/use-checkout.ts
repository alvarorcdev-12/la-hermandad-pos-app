import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { checkoutError } from '@/actions/orders/order-error';
import { checkoutKeys, orderKeys } from '../orders/order-keys';
import { useState } from 'react';
import { createOrderAction } from '@/actions/orders/create-order.action';
import { getOrderAction } from '@/actions/orders/get-orders.action';
import { addPaymentAction } from '@/actions/payment/add-payment.action';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { useCartStore } from '@/presentation/stores/cart.store';
import { emptyCheckout, runCheckout, type Checkout, type CheckoutCommand } from './checkout-flow';

export function useCheckout() {
  const client = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const revision = useCartStore((s) => s.revision);
  const pending = useCartStore((s) => s.pending);
  const [error, setError] = useState('');
  const scope = [user?.id, user?.storeName];
  const key = checkoutKeys.session(user?.id, user?.storeName, revision);
  const { data: checkout } = useQuery<Checkout>({
    queryKey: key,
    queryFn: emptyCheckout,
    initialData: emptyCheckout,
    enabled: false,
    gcTime: Infinity,
  });
  const mutation = useMutation({
    mutationKey: ['checkout-operation', ...scope],
    retry: false,
    networkMode: 'always',
    mutationFn: async (command: CheckoutCommand) => {
      const cart = useCartStore.getState();
      const session = useAuthStore.getState();
      const isCurrent = () =>
        useCartStore.getState().revision === revision &&
        useAuthStore.getState().user?.id === user?.id &&
        useAuthStore.getState().user?.storeName === user?.storeName;
      if (!user || session.authStatus !== 'authenticated' || !session.token)
        throw new Error('Inicia sesión para guardar el pedido.');
      const token = session.token;
      const read = () => client.getQueryData<Checkout>(key) ?? emptyCheckout();
      const hadOrder = !!read().order;
      try {
        await runCheckout(
          {
            read,
            write: (state) => {
              if (!isCurrent()) return;
              client.setQueryData(key, state);
              if (state.order) {
                cart.attachOrder(state.order.id);
                client.setQueryData(
                  orderKeys.detail(user?.id, user?.storeName, state.order.id),
                  state.order
                );
              }
            },
            create: (payload) => createOrderAction(payload, token),
            pay: (payload) => addPaymentAction(payload, token),
            getOrder: (id) => getOrderAction(id, token),
            isCurrent,
            isDefiniteRejection: (error) =>
              isAxiosError(error) &&
              !!error.response &&
              [400, 401, 403, 404, 409, 422, 429].includes(error.response.status),
          },
          {
            ...(cart.selectedCustomer ? { customerId: cart.selectedCustomer.id } : {}),
            items: cart.cart.map(({ productId, quantity }) => ({ productId, quantity })),
          },
          command
        );
      } finally {
        if (isCurrent()) {
          const state = read();
          cart.endCheckout(!!state.order || !!state.uncertain);
          if (state.order || state.uncertain) {
            void client.invalidateQueries({ queryKey: orderKeys.scope(user?.id, user?.storeName) });
            if (!hadOrder) {
              void client.invalidateQueries({ queryKey: ['products'] });
              void client.invalidateQueries({ queryKey: ['product'] });
            }
          }
        }
      }
    },
  });
  const submit = (command: CheckoutCommand) => {
    if (!useAuthStore.getState().token || useAuthStore.getState().authStatus !== 'authenticated') {
      setError('Inicia sesión para guardar el pedido.');
      return;
    }
    // El cerrojo síncrono también cubre dos pulsaciones antes del próximo render.
    if (!useCartStore.getState().beginCheckout()) return;
    setError('');
    mutation.mutate(command, {
      onError: (e) => {
        if (useCartStore.getState().revision === revision) setError(checkoutError(e));
      },
    });
  };
  const finish = () => {
    const state = client.getQueryData<Checkout>(key);
    if (
      !useCartStore.getState().pending &&
      state?.order &&
      !state.uncertain &&
      (state.remaining === 0 || state.savedUnpaid)
    ) {
      useCartStore.getState().finishCheckout();
      client.removeQueries({ queryKey: key, exact: true });
    }
  };
  return { checkout, pending, error, dismissError: () => setError(''), submit, finish };
}
