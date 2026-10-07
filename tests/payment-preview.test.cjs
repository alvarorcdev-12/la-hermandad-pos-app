const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
// Compile only the pure simulation module; no React Native runtime or extra dependencies.
const source = fs.readFileSync('presentation/components/payments/payment-preview-state.ts', 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});
const moduleExports = { exports: {} };
new Function('exports', 'module', compiled.outputText)(moduleExports.exports, moduleExports);
const {
  createPreview,
  cashChange,
  previewReducer: reduce,
  editAmount,
  inputAmount,
  remainingAmount,
  validEntry,
} = moduleExports.exports;
const type = (state, value) =>
  [...value].reduce((s, key) => reduce(s, { type: 'key', key }), state);

test('decimal entry, deletion, precision and length limits', () => {
  assert.equal(editAmount('', '.'), '0.');
  assert.equal(editAmount('12.', '.'), '12.');
  assert.equal(editAmount('12.34', '5'), '12.34');
  assert.equal(editAmount('12.34', 'delete'), '12.3');
  assert.equal(editAmount('1234567890', '1'), '1234567890');
  assert.equal(inputAmount('12.3'), 1230);
});

test('cash rejects insufficient amounts; overpayment completes only the total', () => {
  let s = type(reduce(createPreview(40.25), { type: 'start', mode: 'cash' }), '40');
  assert.equal(validEntry(s), false);
  assert.equal(reduce(s, { type: 'confirm', index: 0 }), s);
  s = type({ ...s, input: '' }, '50.50');
  assert.equal(inputAmount(s.input) - s.total, 1025);
  s = reduce(s, { type: 'confirm', index: 0 });
  assert.equal(s.step, 'complete');
  assert.equal(s.payments[0].amount, 4025);
  assert.equal(reduce(s, { type: 'confirm', index: 0 }), s);
});

test('split cash and QR preserve cents, count only confirmations and reject duplicate taps', () => {
  let s = type(reduce(createPreview(40.25), { type: 'start', mode: 'split' }), '10.10');
  s = reduce(s, { type: 'method', method: 'qr' });
  assert.equal(s.payments.length, 0);
  s = reduce(s, { type: 'method', method: 'cash' });
  s = reduce(s, { type: 'show-cash' });
  s = type(s, '20');
  assert.equal(cashChange(s), 990);
  s = reduce(s, { type: 'confirm', index: 0 });
  assert.equal(remainingAmount(s), 3015);
  assert.equal(s.payments.length, 1);
  assert.equal(reduce(s, { type: 'confirm', index: 0 }), s);
  s = type(s, '40');
  assert.equal(validEntry(s), false);
  s = reduce(s, { type: 'exact' });
  s = reduce(s, { type: 'method', method: 'qr' });
  assert.equal(reduce(s, { type: 'confirm', index: 1 }), s);
  s = reduce(s, { type: 'show-qr' });
  assert.equal(s.step, 'qr');
  assert.equal(inputAmount(s.input), 3015);
  s = reduce(s, { type: 'confirm', index: 1 });
  assert.equal(s.step, 'complete');
  assert.equal(remainingAmount(s), 0);
  assert.deepEqual(
    s.payments.map((p) => p.method),
    ['cash', 'qr']
  );
});

test('direct QR, unpaid confirmation and partial exit stay in local state', () => {
  const initial = createPreview(20);
  let qr = reduce(initial, { type: 'start', mode: 'qr' });
  assert.equal(qr.step, 'qr');
  assert.equal(reduce(qr, { type: 'confirm', index: 0 }).step, 'complete');
  let unpaid = reduce(initial, { type: 'unpaid' });
  assert.equal(unpaid.step, 'unpaid');
  assert.equal(reduce(unpaid, { type: 'confirm-unpaid' }).step, 'unpaid-complete');
  let split = type(reduce(initial, { type: 'start', mode: 'split' }), '5');
  split = reduce(split, { type: 'show-cash' });
  split = reduce(split, { type: 'exact' });
  split = reduce(split, { type: 'confirm', index: 0 });
  split = reduce(split, { type: 'back' });
  assert.equal(split.step, 'partial');
  assert.equal(remainingAmount(split), 1500);
  assert.equal(reduce(split, { type: 'resume' }).payments.length, 1);
  assert.deepEqual(initial.payments, []);
  assert.deepEqual(createPreview(20), initial);
});

test('invalid totals cannot start a payment; zero installments cannot confirm', () => {
  for (const total of [0, -1, NaN, Infinity]) {
    const s = createPreview(total);
    assert.equal(reduce(s, { type: 'start', mode: 'qr' }), s);
  }
  const s = reduce(createPreview(1), { type: 'start', mode: 'split' });
  assert.equal(validEntry(s), false);
  assert.equal(reduce(s, { type: 'confirm', index: 0 }), s);
});

test('split cash applies only the installment: 45 due, 20 applied, 50 received, 30 change', () => {
  let s = type(reduce(createPreview(45), { type: 'start', mode: 'split' }), '20');
  assert.equal(reduce(s, { type: 'confirm', index: 0 }), s);
  s = reduce(s, { type: 'show-cash' });
  assert.equal(s.step, 'cash');
  assert.equal(s.receivedInput, '');
  assert.equal(s.payments.length, 0);
  assert.equal(remainingAmount(s), 4500);
  s = type(s, '50');
  assert.equal(validEntry(s), true);
  assert.equal(cashChange(s), 3000);
  s = reduce(s, { type: 'confirm', index: 0 });
  assert.equal(remainingAmount(s), 2500);
  assert.deepEqual(s.payments, [{ method: 'cash', amount: 2000 }]);
  assert.equal(s.input, '');
  assert.equal(s.receivedInput, '');
  assert.equal(reduce(s, { type: 'confirm', index: 0 }), s);
});

test('split cash rejects insufficient receipt and accepts exact receipt', () => {
  let s = type(reduce(createPreview(45), { type: 'start', mode: 'split' }), '20.25');
  s = reduce(s, { type: 'show-cash' });
  assert.equal(validEntry(s), false);
  s = type(s, '20');
  assert.equal(validEntry(s), false);
  assert.equal(cashChange(s), 0);
  assert.equal(reduce(s, { type: 'confirm', index: 0 }), s);
  s = reduce(s, { type: 'exact' });
  assert.equal(s.receivedInput, '20.25');
  assert.equal(validEntry(s), true);
  assert.equal(cashChange(s), 0);
  s = reduce(s, { type: 'confirm', index: 0 });
  assert.equal(remainingAmount(s), 2475);
});

test('back from cash preserves installments and amount without advancing, clears receipt', () => {
  let s = type(reduce(createPreview(45), { type: 'start', mode: 'split' }), '5');
  s = reduce(s, { type: 'show-cash' });
  s = reduce(s, { type: 'exact' });
  s = reduce(s, { type: 'confirm', index: 0 });
  s = type(s, '20');
  s = reduce(s, { type: 'show-cash' });
  s = type(s, '50');
  s = reduce(s, { type: 'back' });
  assert.equal(s.step, 'entry');
  assert.equal(s.input, '20');
  assert.equal(s.receivedInput, '');
  assert.equal(s.payments.length, 1);
  assert.equal(remainingAmount(s), 4000);
  s = reduce(s, { type: 'method', method: 'qr' });
  s = reduce(s, { type: 'show-qr' });
  s = reduce(s, { type: 'confirm', index: 1 });
  assert.equal(remainingAmount(s), 2000);
  assert.deepEqual(s.payments, [
    { method: 'cash', amount: 500 },
    { method: 'qr', amount: 2000 },
  ]);
  assert.equal(s.input, '');
  assert.equal(s.receivedInput, '');
});

test('invalid split installment cannot enter cash receipt', () => {
  for (const amount of ['0', '45.01']) {
    const s = type(reduce(createPreview(45), { type: 'start', mode: 'split' }), amount);
    assert.equal(reduce(s, { type: 'show-cash' }), s);
  }
});
