import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getOrderAction, getOrdersAction } from '@/actions/orders/get-orders.action';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { useCartStore } from '@/presentation/stores/cart.store';
import { emptyCheckout, moneyCents } from '../payments/checkout-flow';
import { checkoutError } from '@/actions/orders/order-error';
import { checkoutKeys, orderKeys } from './order-keys';

export function useOrders(page: number) {
  const user = useAuthStore((s) => s.user);
  const client = useQueryClient();
  const [error, setError] = useState('');
  const query = useQuery({
    queryKey: orderKeys.list(user?.id, user?.storeName, page),
    queryFn: () => getOrdersAction(page),
    enabled: !!user,
    staleTime: 0,
  });
  const resume = useMutation({
    retry: false,
    mutationFn: async (id: string) => {
      const cart = useCartStore.getState();
      const revision = cart.revision;
      const token = useAuthStore.getState().token;
      if (!token || !user) throw new Error('Inicia sesión para continuar.');
      if (cart.cart.length || cart.locked)
        throw new Error('Termina o retoma el carrito actual antes de abrir otro pedido.');
      if (!cart.beginCheckout()) throw new Error('Ya hay una operación pendiente.');
      try {
        const order = await getOrderAction(id, token);
        if (useCartStore.getState().revision !== revision) throw new Error('La sesión cambió.');
        if (order.id !== id || order.status !== 'OPEN' || order.financialStatus !== 'PENDING')
          throw new Error(
            'Solo se pueden retomar aquí pedidos abiertos sin pagos. Para pedidos parciales usa su carrito activo; la API no expone el saldo anterior.'
          );
        const remaining = moneyCents(order.totalPrice);
        const items = order.items.map((item) => ({
          productId: item.productId,
          title: item.title,
          quantity: item.quantity,
          unitPrice: moneyCents(item.unitPrice) / 100,
        }));
        const customer = order.customer
          ? {
              id: order.customer.id,
              displayName: [order.customer.firstName, order.customer.lastName]
                .filter(Boolean)
                .join(' '),
            }
          : null;
        client.setQueryData(checkoutKeys.session(user?.id, user?.storeName, revision), {
          ...emptyCheckout(),
          order,
          remaining,
        });
        cart.restoreOrder(order.id, items, customer);
      } finally {
        if (useCartStore.getState().revision === revision)
          cart.endCheckout(!!useCartStore.getState().orderId);
      }
    },
  });
  return {
    ...query,
    errorMessage: error,
    dismissError: () => setError(''),
    resuming: resume.isPending,
    resume: (id: string, onSuccess: () => void) => {
      setError('');
      resume.mutate(id, { onSuccess, onError: (error) => setError(checkoutError(error)) });
    },
  };
}
