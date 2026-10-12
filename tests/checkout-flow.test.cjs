const assert = require('node:assert/strict');
const { test } = require('node:test');
const load = require('./load-typescript.cjs');
const { QueryClient, MutationObserver } = require('@tanstack/react-query');
const { runCheckout, emptyCheckout, moneyCents } = load('presentation/hooks/payments/checkout-flow.ts');
const { useCartStore } = load('presentation/stores/cart.store.ts');
const payload = { customerId: 'customer-1', items: [{ productId: 'product-1', quantity: 2 }] };
function fixture(total = '45.00') {
  let state = emptyCheckout();
  let order = { id: 'order-1', name: '#101', totalPrice: total, status: 'OPEN', financialStatus: 'PENDING', customer: { id: payload.customerId } };
  let balance = moneyCents(total);
  let current = true;
  const calls = { create: [], pay: [], get: [] };
  const d = {
    read: () => state, write: (s) => { state = s; },
    isCurrent: () => current,
    isDefiniteRejection: (e) => e?.rejected === true,
    create: async (p) => { calls.create.push(p); return { ...order }; },
    pay: async (p) => {
      calls.pay.push(p); balance -= Math.round(p.amount * 100);
      order = { ...order, financialStatus: balance === 0 ? 'PAID' : 'PARTIALLY_PAID' };
      return { amount: p.amount.toFixed(2), method: p.method, remainingBalance: (balance / 100).toFixed(2) };
    },
    getOrder: async (id) => { calls.get.push(id); return { ...order }; },
  };
  return { d, calls, read: d.read, changeSession: () => { current = false; }, setOrder: (next) => { order = { ...order, ...next }; },
    run: (command) => runCheckout(d, payload, command),
    pay: (amount, method = 'cash') => runCheckout(d, payload, { type: 'pay', amount, method, expectedTotal: moneyCents(total), expectedPaymentCount: state.payments.length }),
  };
}
const rejected = () => Object.assign(new Error('Rechazo controlado'), { rejected: true });

test('pago completo efectivo: conserva cliente y cantidades, solo aplica el importe debido', async () => {
  const f = fixture(); await f.pay(4500);
  assert.deepEqual(f.calls.create, [payload]);
  assert.deepEqual(f.calls.pay, [{ orderId: 'order-1', method: 'CASH', amount: 45 }]);
  assert.equal(f.read().remaining, 0);
  assert.equal(f.read().order.financialStatus, 'PAID');
});
test('pago completo QR manual', async () => {
  const f = fixture(); assert.equal(f.calls.pay.length, 0);
  await f.pay(4500, 'qr');
  assert.equal(f.calls.pay[0].method, 'QR');
  assert.equal(f.read().remaining, 0);
});
test('pago dividido efectivo y QR usa siempre el mismo pedido', async () => {
  const f = fixture(); await f.pay(2000); await f.pay(2500, 'qr');
  assert.equal(f.calls.create.length, 1);
  assert.deepEqual(f.calls.pay.map(p => p.orderId), ['order-1', 'order-1']);
  assert.deepEqual(f.read().payments, [{ method: 'cash', amount: 2000 }, { method: 'qr', amount: 2500 }]);
});
test('pedido sin pagar: no genera importe cero y reutiliza el pedido', async () => {
  const f = fixture(); await f.run({ type: 'unpaid' }); await f.run({ type: 'unpaid' });
  assert.equal(f.calls.create.length, 1);
  assert.equal(f.calls.pay.length, 0);
  assert.equal(f.read().savedUnpaid, true);
  assert.equal(f.read().order.financialStatus, 'PENDING');
});
test('marcar sin pagar un pedido parcial no elimina ni cambia sus abonos', async () => {
  const f = fixture(); await f.pay(2000);
  await assert.rejects(f.run({ type: 'unpaid' }), /tiene abonos/);
  assert.equal(f.read().order.financialStatus, 'PARTIALLY_PAID');
  assert.equal(f.read().payments.length, 1);
  assert.equal(f.calls.create.length, 1);
});
test('fallo definitivo de creación conserva estado sin pagos y permite reintentar', async () => {
  const f = fixture(); const original = f.d.create;
  f.d.create = async () => { throw rejected(); };
  await assert.rejects(f.pay(4500));
  assert.deepEqual(f.read(), emptyCheckout());
  assert.equal(f.calls.pay.length, 0);
  f.d.create = original; await f.pay(4500);
  assert.equal(f.read().remaining, 0);
});
test('fallo del primer pago conserva ID y reintenta sin crear otro pedido', async () => {
  const f = fixture(); const original = f.d.pay;
  f.d.pay = async () => { throw rejected(); };
  await assert.rejects(f.pay(4500));
  assert.equal(f.read().order.id, 'order-1');
  assert.equal(f.read().payments.length, 0);
  f.d.pay = original; await f.pay(4500);
  assert.equal(f.calls.create.length, 1);
});
test('fallo posterior conserva los abonos anteriores y el saldo', async () => {
  const f = fixture(); await f.pay(2000);
  const original = f.d.pay; f.d.pay = async () => { throw rejected(); };
  await assert.rejects(f.pay(2500, 'qr'));
  assert.equal(f.read().remaining, 2500);
  assert.deepEqual(f.read().payments, [{ method: 'cash', amount: 2000 }]);
  f.d.pay = original; await f.pay(2500, 'qr');
  assert.equal(f.calls.create.length, 1);
});
test('timeout creando: no adivina un ID ni repite la creación', async () => {
  const f = fixture(); let attempts = 0;
  f.d.create = async () => { attempts++; throw new Error('timeout'); };
  await assert.rejects(f.pay(4500));
  assert.equal(f.read().uncertain, 'order');
  await assert.rejects(f.pay(4500), /verificación/);
  await assert.rejects(f.run({ type: 'verify' }), /identificador/);
  assert.equal(attempts, 1);
});
test('timeout en pago parcial: consulta estado pero bloquea reenvío sin historial', async () => {
  const f = fixture(); let attempts = 0;
  f.d.pay = async () => { attempts++; f.setOrder({ financialStatus: 'PARTIALLY_PAID' }); throw new Error('timeout'); };
  await assert.rejects(f.pay(2000), /verificación/);
  assert.equal(f.read().uncertain, 'payment');
  assert.equal(f.read().payments.length, 0);
  await assert.rejects(f.pay(2000));
  await assert.rejects(f.run({ type: 'verify' }));
  assert.equal(attempts, 1);
  assert.ok(f.calls.get.length >= 2);
});
test('timeout completo: GET PAID permite finalizar sin repetir ni inventar recibo', async () => {
  const f = fixture(); let attempts = 0;
  f.d.pay = async () => { attempts++; f.setOrder({ financialStatus: 'PAID' }); throw new Error('timeout'); };
  await f.pay(4500);
  assert.equal(f.read().remaining, 0);
  assert.equal(f.read().uncertain, null);
  assert.equal(f.read().payments.length, 0);
  assert.equal(attempts, 1);
});
test('timeout y lectura fallida: verificación posterior recupera PAID sin cobrar', async () => {
  const f = fixture(); const get = f.d.getOrder;
  f.d.pay = async () => { f.setOrder({ financialStatus: 'PAID' }); f.d.getOrder = async () => { throw new Error('offline'); }; throw new Error('timeout'); };
  await assert.rejects(f.pay(4500));
  assert.equal(f.read().uncertain, 'payment');
  f.d.getOrder = get; await f.run({ type: 'verify' });
  assert.equal(f.read().remaining, 0);
  assert.equal(f.calls.create.length, 1);
});
test('respuesta inválida bloquea reintento y conserva el pedido', async () => {
  const f = fixture(); f.d.pay = async () => ({ amount: 'NaN', remainingBalance: '25.00', method: 'CASH' });
  await assert.rejects(f.pay(2000), /verificación/);
  assert.equal(f.read().order.id, 'order-1');
  assert.equal(f.read().uncertain, 'payment');
});
test('precio real diferente: guarda ID, muestra total real y exige nueva confirmación', async () => {
  const f = fixture(); f.setOrder({ totalPrice: '50.00' });
  await assert.rejects(f.pay(4500), /precio cambió/);
  assert.equal(f.read().remaining, 5000);
  assert.equal(f.calls.pay.length, 0);
  assert.equal(f.read().order.id, 'order-1');
});
test('respuesta de sesión anterior no actualiza caché ni dispara pago', async () => {
  const f = fixture(); const original = f.d.create;
  f.d.create = async (p) => { const order = await original(p); f.changeSession(); return order; };
  await assert.rejects(f.pay(4500), /sesión cambió/);
  assert.deepEqual(f.read(), emptyCheckout());
  assert.equal(f.calls.pay.length, 0);
});
test('doble pulsación: cerrojo Zustand + mutación sin retries ejecutan un solo POST', async () => {
  useCartStore.getState().resetSession();
  const f = fixture();
  const client = new QueryClient();
  const observer = new MutationObserver(client, { retry: false, mutationFn: () => f.pay(2000) });
  const submit = () => {
    if (!useCartStore.getState().beginCheckout()) return Promise.resolve();
    return observer.mutate().finally(() => useCartStore.getState().endCheckout(!!f.read().order));
  };
  await Promise.all([submit(), submit()]);
  assert.equal(f.calls.create.length, 1);
  assert.equal(f.calls.pay.length, 1);
  await assert.rejects(f.run({ type: 'pay', amount: 2000, method: 'cash', expectedTotal: 4500, expectedPaymentCount: 0 }), /ya fue procesado/);
  assert.equal(f.calls.pay.length, 1);
  client.clear();
});
test('carrito registrado bloquea productos, cantidades, cliente y borrado; limpieza única reinicia sesión', () => {
  const cart = useCartStore.getState(); cart.resetSession();
  cart.addProductToCart({ productId: 'p', title: 'Producto', quantity: 2, unitPrice: 10 });
  cart.setSelectedCustomer({ id: 'c', displayName: 'Cliente' });
  cart.beginCheckout(); cart.attachOrder('order-1'); cart.endCheckout(true);
  cart.addProductToCart({ productId: 'q', title: 'Otro', quantity: 1, unitPrice: 5 });
  cart.updateCartItemQuantity('p', 1); cart.removeCartItem('p'); cart.clearCart();
  cart.setSelectedCustomer({ id: 'otro', displayName: 'Otro' }); cart.clearSelectedCustomer();
  assert.equal(useCartStore.getState().cart.length, 1);
  assert.equal(useCartStore.getState().cart[0].quantity, 2);
  assert.equal(useCartStore.getState().selectedCustomer.id, 'c');
  assert.equal(useCartStore.getState().orderId, 'order-1');
  const revision = useCartStore.getState().revision; cart.finishCheckout();
  assert.equal(useCartStore.getState().cart.length, 0);
  assert.equal(useCartStore.getState().selectedCustomer, null);
  assert.equal(useCartStore.getState().revision, revision + 1);
});
test('decimales externos se validan en ejecución', () => {
  assert.equal(moneyCents('123.45'), 12345);
  for (const value of ['-1', '1.234', 'NaN', '', '9007199254740992', 12]) assert.throws(() => moneyCents(value));
});

test('actions respetan rutas, payload y credenciales de la sesión; no envían recibido ni cambio', async () => {
  const requests = [];
  const api = { post: async (...args) => { requests.push(args); return { data: {} }; } };
  const mocks = { '@/infrastructure/api/la-hermandad-api': { laHermandadApi: api } };
  const { createOrderAction } = load('actions/orders/create-order.action.ts', mocks);
  const { addPaymentAction } = load('actions/payment/add-payment.action.ts', mocks);
  await createOrderAction(payload, 'mock-token');
  await addPaymentAction({ orderId: 'order-1', amount: 20, method: 'CASH', received: 50, change: 30 }, 'mock-token');
  assert.equal(requests[0][0], '/orders');
  assert.deepEqual(requests[0][1], payload);
  assert.equal(requests[1][0], '/orders/order-1/payment');
  assert.deepEqual(requests[1][1], { amount: 20, method: 'CASH' });
  assert.equal(requests[1][2].headers.Authorization, 'Bearer mock-token');
});

test('la lectura posterior fallida no pierde un pago ya confirmado', async () => {
  const f = fixture(); const original = f.d.pay;
  f.d.pay = async (p) => { const result = await original(p); f.d.getOrder = async () => { throw new Error('offline'); }; return result; };
  await f.pay(2000);
  assert.equal(f.read().remaining, 2500);
  assert.equal(f.read().payments.length, 1);
  assert.equal(f.read().uncertain, null);
});
test('pago de cero y cantidades inválidas se rechazan antes de crear', async () => {
  const f = fixture();
  await assert.rejects(f.pay(0), /importe válido/);
  await assert.rejects(runCheckout(f.d, { items: [{ productId: 'p', quantity: -1 }] }, { type: 'unpaid' }), /cantidades/);
  assert.equal(f.calls.create.length, 0);
});
test('claves de pedidos y cobro aíslan usuario, tienda y revisión', () => {
  const { orderKeys, checkoutKeys } = load('presentation/hooks/orders/order-keys.ts');
  assert.notDeepEqual(orderKeys.list('user', 'A', 1), orderKeys.list('user', 'B', 1));
  assert.notDeepEqual(orderKeys.list('user', 'A', 1), orderKeys.list('other', 'A', 1));
  assert.notDeepEqual(checkoutKeys.session('user', 'A', 1), checkoutKeys.session('user', 'A', 2));
});
test('cambio de sesión elimina pedidos y abonos sensibles de la caché', () => {
  const { create } = require('zustand');
  const auth = create(() => ({ user: { id: 'a', storeName: 'tienda' }, authStatus: 'authenticated' }));
  const { queryClient } = load('lib/query-client.ts', { '@/presentation/stores/auth.store': { useAuthStore: auth } });
  queryClient.setQueryData(['checkout', 'a', 'tienda', 1], { order: 'privado' });
  queryClient.setQueryData(['orders', 'a', 'tienda', 'list', 1], ['privado']);
  auth.setState({ user: { id: 'b', storeName: 'otra' } });
  assert.equal(queryClient.getQueryData(['checkout', 'a', 'tienda', 1]), undefined);
  assert.equal(queryClient.getQueryData(['orders', 'a', 'tienda', 'list', 1]), undefined);
  queryClient.clear();
});
