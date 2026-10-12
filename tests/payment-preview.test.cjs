const assert = require('node:assert/strict');
const { test } = require('node:test');
const load = require('./load-typescript.cjs');
const { createPreview, cashChange, previewReducer: reduce, editAmount, inputAmount, remainingAmount, validEntry } = load('presentation/components/payments/payment-preview-state.ts');
const type = (s, value) => [...value].reduce((state, key) => reduce(state, { type: 'key', key }), s);

test('entrada decimal conserva precisión, límites y borrado', () => {
  assert.equal(editAmount('', '.'), '0.');
  assert.equal(editAmount('12.', '.'), '12.');
  assert.equal(editAmount('12.34', '5'), '12.34');
  assert.equal(editAmount('12.34', 'delete'), '12.3');
  assert.equal(editAmount('1234567890', '1'), '1234567890');
  assert.equal(inputAmount('12.3'), 1230);
});
test('abrir, elegir método, introducir importe y mostrar QR no registran pagos', () => {
  let s = type(reduce(createPreview(45), { type: 'start', mode: 'split' }), '20');
  s = reduce(s, { type: 'method', method: 'qr' });
  s = reduce(s, { type: 'show-qr' });
  assert.equal(s.step, 'qr');
  assert.deepEqual(s.payments, []);
  assert.equal(remainingAmount(s), 4500);
});
test('efectivo completo distingue cobro de 40.25 y recibido de 50.50', () => {
  let s = type(reduce(createPreview(40.25), { type: 'start', mode: 'cash' }), '40');
  assert.equal(validEntry(s), false);
  s = type({ ...s, input: '' }, '50.50');
  assert.equal(validEntry(s), true);
  assert.equal(cashChange(s), 1025);
  assert.deepEqual(s.payments, []);
});
test('abono de Bs 20, recibido 50 y cambio 30; solo avanza con respuesta confirmada', () => {
  let s = type(reduce(createPreview(45), { type: 'start', mode: 'split' }), '20');
  s = reduce(s, { type: 'show-cash' });
  assert.equal(validEntry(s), false);
  s = type(s, '50');
  assert.equal(validEntry(s), true);
  assert.equal(cashChange(s), 3000);
  assert.equal(remainingAmount(s), 4500);
  s = reduce(s, { type: 'sync', total: 4500, remaining: 2500, payments: [{ method: 'cash', amount: 2000 }], unpaid: false });
  assert.equal(remainingAmount(s), 2500);
  assert.equal(s.input, '');
  assert.equal(s.receivedInput, '');
  assert.equal(s.payments.length, 1);
});
test('saldo autoritativo y reapertura preservan los abonos; salir no los borra', () => {
  const payments = [{ method: 'cash', amount: 2000 }];
  let s = reduce(createPreview(45), { type: 'sync', total: 4500, remaining: 2500, payments, unpaid: false });
  assert.equal(s.step, 'entry');
  assert.equal(s.split, true);
  s = reduce(s, { type: 'back' });
  assert.equal(s.step, 'partial');
  s = reduce(s, { type: 'resume' });
  assert.deepEqual(s.payments, payments);
  assert.equal(remainingAmount(s), 2500);
  s = reduce(s, { type: 'sync', total: 4500, remaining: 0, payments, unpaid: false });
  assert.equal(s.step, 'complete');
});
test('sin pagar no muestra éxito hasta la respuesta; valores inválidos no inician cobro', () => {
  let s = reduce(createPreview(20), { type: 'unpaid' });
  assert.equal(s.step, 'unpaid');
  s = reduce(s, { type: 'sync', total: 2000, remaining: 2000, payments: [], unpaid: true });
  assert.equal(s.step, 'unpaid-complete');
  for (const amount of [0, -1, NaN, Infinity]) {
    const initial = createPreview(amount);
    assert.equal(reduce(initial, { type: 'start', mode: 'qr' }), initial);
  }
});
test('abonos inválidos no avanzan a recibido; retroceder conserva importe', () => {
  for (const amount of ['0', '45.01']) {
    const s = type(reduce(createPreview(45), { type: 'start', mode: 'split' }), amount);
    assert.equal(reduce(s, { type: 'show-cash' }), s);
  }
  let s = type(reduce(createPreview(45), { type: 'start', mode: 'split' }), '20.25');
  s = type(reduce(s, { type: 'show-cash' }), '20');
  assert.equal(validEntry(s), false);
  s = reduce(s, { type: 'exact' });
  assert.equal(s.receivedInput, '20.25');
  assert.equal(validEntry(s), true);
  s = reduce(s, { type: 'back' });
  assert.equal(s.input, '20.25');
  assert.equal(s.receivedInput, '');
});
