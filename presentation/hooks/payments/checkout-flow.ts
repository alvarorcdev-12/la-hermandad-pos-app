import type { OrderDB } from '@/infrastructure/interfaces/orders-response.interface';
import type { CreateOrderPayload } from '@/infrastructure/interfaces/payload/create-order-payload.interface';
import type { AddPaymentPayload } from '@/infrastructure/interfaces/payload/add-payment-payload.interface';
import type { AddPaymentResponse } from '@/infrastructure/interfaces/add-payment-response.interface';

export type SavedPayment = { method: 'cash' | 'qr'; amount: number };
export type Checkout = {
  order: OrderDB | null;
  remaining: number | null;
  payments: SavedPayment[];
  uncertain: 'order' | 'payment' | null;
  savedUnpaid: boolean;
};
export const emptyCheckout = (): Checkout => ({
  order: null,
  remaining: null,
  payments: [],
  uncertain: null,
  savedUnpaid: false,
});

// Los contratos monetarios usan decimales serializados. La UI trabaja en centavos.
export function moneyCents(value: string): number {
  if (typeof value !== 'string' || !/^\d+(\.\d{1,2})?$/.test(value))
    throw new Error('Importe del servidor no válido.');
  const [whole, fraction = ''] = value.split('.');
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(result)) throw new Error('Importe fuera del rango permitido.');
  return result;
}

export type CheckoutCommand =
  | { type: 'unpaid' }
  | { type: 'verify' }
  | {
      type: 'pay';
      amount: number;
      method: 'cash' | 'qr';
      expectedTotal: number;
      expectedPaymentCount: number;
    };
export interface CheckoutDependencies {
  read: () => Checkout;
  write: (state: Checkout) => void;
  create: (payload: CreateOrderPayload) => Promise<OrderDB>;
  pay: (payload: AddPaymentPayload) => Promise<AddPaymentResponse>;
  getOrder: (id: string) => Promise<OrderDB>;
  isCurrent: () => boolean;
  isDefiniteRejection: (error: unknown) => boolean;
}

const verificationMessage =
  'El resultado requiere verificación. No repitas el cobro: la API no permite consultar los abonos ni identificar esta operación.';

function assertCurrent(d: CheckoutDependencies) {
  if (!d.isCurrent())
    throw new Error('La sesión cambió. Consulta el pedido en su tienda original.');
}

function writeCheckout(d: CheckoutDependencies, state: Checkout) {
  assertCurrent(d);
  d.write(state);
}

async function verifyCheckout(d: CheckoutDependencies) {
  const state = d.read();
  if (!state.order)
    throw new Error(
      'No se recibió el identificador del pedido. Verifica en Pedidos antes de cualquier nueva venta; no se volverá a crear automáticamente.'
    );
  const order = await d.getOrder(state.order.id);
  assertCurrent(d);
  if (order.id !== state.order.id) throw new Error(verificationMessage);
  moneyCents(order.totalPrice);
  // PAID permite finalizar el pedido, pero no atribuir un abono a esta solicitud.
  writeCheckout(d, {
    ...state,
    order,
    remaining: order.financialStatus === 'PAID' ? 0 : state.remaining,
    uncertain: order.financialStatus === 'PAID' ? null : state.uncertain,
  });
  if (order.financialStatus !== 'PAID') throw new Error(verificationMessage);
}

async function ensureOrder(d: CheckoutDependencies, payload: CreateOrderPayload) {
  if (d.read().order) return;
  if (
    !payload.items.length ||
    payload.items.some((item) => !Number.isSafeInteger(item.quantity) || item.quantity < 1)
  )
    throw new Error('Revisa los productos y sus cantidades.');
  try {
    const order = await d.create(payload);
    assertCurrent(d);
    if (!order || typeof order.id !== 'string' || !order.id)
      throw new Error('Respuesta de pedido no válida.');
    // Conservar el identificador incluso si otro campo de la respuesta es inválido.
    writeCheckout(d, { ...d.read(), order });
    const total = moneyCents(order.totalPrice);
    if (order.status !== 'OPEN' || order.financialStatus !== 'PENDING')
      throw new Error('Estado inicial del pedido inesperado.');
    writeCheckout(d, { ...d.read(), remaining: total });
  } catch (error) {
    assertCurrent(d);
    if (!d.isDefiniteRejection(error)) {
      writeCheckout(d, { ...d.read(), uncertain: 'order' });
      throw new Error(
        'No se pudo confirmar la creación. El carrito se conserva y queda bloqueado para evitar duplicados. Verifica el pedido antes de continuar.'
      );
    }
    throw error;
  }
}

type RegisteredCheckout = Checkout & { order: OrderDB; remaining: number };

async function saveUnpaid(d: CheckoutDependencies, state: RegisteredCheckout) {
  const { order } = state;
  // Nunca modifica el estado financiero ni elimina pagos de un pedido existente.
  if (state.payments.length || order.financialStatus === 'PARTIALLY_PAID')
    throw new Error(
      'Este pedido tiene abonos. Conserva su estado parcial y retoma el cobro desde el carrito.'
    );
  const fresh = await d.getOrder(order.id);
  assertCurrent(d);
  if (fresh.id !== order.id) throw new Error('No se pudo verificar el pedido.');
  moneyCents(fresh.totalPrice);
  if (fresh.financialStatus === 'PAID') {
    writeCheckout(d, { ...state, order: fresh, remaining: 0, savedUnpaid: false });
    return;
  }
  if (fresh.status !== 'OPEN' || fresh.financialStatus !== 'PENDING') {
    writeCheckout(d, { ...state, order: fresh, savedUnpaid: false, uncertain: 'payment' });
    throw new Error('El pedido cambió de estado. Verifica sus abonos antes de continuar.');
  }
  writeCheckout(d, {
    ...state,
    order: fresh,
    remaining: moneyCents(fresh.totalPrice),
    savedUnpaid: true,
  });
  return;
}

async function registerPayment(
  d: CheckoutDependencies,
  state: RegisteredCheckout,
  command: Extract<CheckoutCommand, { type: 'pay' }>
) {
  const { order } = state;
  if (moneyCents(order.totalPrice) !== command.expectedTotal)
    throw new Error(
      'El precio cambió. Revisa el total actualizado y confirma nuevamente; el pedido ya está guardado.'
    );
  if (command.amount > state.remaining || state.remaining <= 0)
    throw new Error('El importe supera el saldo pendiente.');
  // Consulta el estado antes de cada abono, sin fingir una transacción entre solicitudes.
  const fresh = await d.getOrder(order.id);
  assertCurrent(d);
  if (fresh.id !== order.id) throw new Error('No se pudo verificar el pedido.');
  moneyCents(fresh.totalPrice);
  if (fresh.financialStatus === 'PAID') {
    writeCheckout(d, { ...state, order: fresh, remaining: 0 });
    return;
  }
  if (fresh.status !== 'OPEN' || !['PENDING', 'PARTIALLY_PAID'].includes(fresh.financialStatus))
    throw new Error('El estado del pedido no permite pagos.');
  if (
    moneyCents(fresh.totalPrice) !== moneyCents(order.totalPrice) ||
    (fresh.financialStatus === 'PARTIALLY_PAID' && state.payments.length === 0)
  ) {
    writeCheckout(d, { ...state, order: fresh, uncertain: 'payment' });
    throw new Error(verificationMessage);
  }
  try {
    const response = await d.pay({
      orderId: order.id,
      amount: command.amount / 100,
      method: command.method === 'cash' ? 'CASH' : 'QR',
    });
    assertCurrent(d);
    const amount = moneyCents(response.amount);
    const remaining = moneyCents(response.remainingBalance);
    if (
      amount !== command.amount ||
      response.method !== (command.method === 'cash' ? 'CASH' : 'QR') ||
      remaining > moneyCents(order.totalPrice) - amount
    )
      throw new Error('Respuesta de pago no válida.');
    writeCheckout(d, {
      ...state,
      remaining,
      savedUnpaid: false,
      payments: [...state.payments, { method: command.method, amount }],
    });
    // El saldo confirmado ya está guardado aunque falle esta lectura adicional.
    try {
      const updated = await d.getOrder(order.id);
      assertCurrent(d);
      moneyCents(updated.totalPrice);
      if (
        updated.id === order.id &&
        moneyCents(updated.totalPrice) === moneyCents(order.totalPrice)
      )
        writeCheckout(d, { ...d.read(), order: updated });
    } catch {
      /* El recibo de pago es autoritativo para el saldo. */
    }
  } catch (error) {
    assertCurrent(d);
    if (!d.isDefiniteRejection(error)) {
      writeCheckout(d, { ...d.read(), uncertain: 'payment' });
      try {
        await verifyCheckout(d);
      } catch {
        throw new Error(verificationMessage);
      }
      return;
    }
    throw error;
  }
}

export async function runCheckout(
  d: CheckoutDependencies,
  payload: CreateOrderPayload,
  command: CheckoutCommand
): Promise<void> {
  assertCurrent(d);
  if (command.type === 'verify') return verifyCheckout(d);
  if (d.read().uncertain) throw new Error(verificationMessage);
  if (command.type === 'pay' && command.expectedPaymentCount !== d.read().payments.length)
    throw new Error('Este abono ya fue procesado. Revisa el saldo actualizado.');
  if (command.type === 'pay' && (!Number.isSafeInteger(command.amount) || command.amount <= 0))
    throw new Error('Introduce un importe válido.');
  await ensureOrder(d, payload);
  const state = d.read();
  if (!state.order || state.remaining === null) throw new Error(verificationMessage);
  const registered = { ...state, order: state.order, remaining: state.remaining };
  if (command.type === 'unpaid') return saveUnpaid(d, registered);
  return registerPayment(d, registered, command);
}
