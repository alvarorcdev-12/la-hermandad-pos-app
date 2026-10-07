// Isolated UI simulation: amounts are integer minor units, never persisted.
export type PaymentMethod = 'cash' | 'qr';
export type PreviewStep =
  'options' | 'entry' | 'cash' | 'qr' | 'unpaid' | 'partial' | 'complete' | 'unpaid-complete';
export type PreviewPayment = { method: PaymentMethod; amount: number };
export type PreviewState = {
  total: number;
  step: PreviewStep;
  split: boolean;
  method: PaymentMethod;
  input: string;
  receivedInput: string;
  payments: PreviewPayment[];
};
export type PreviewAction =
  | { type: 'start'; mode: 'cash' | 'qr' | 'split' }
  | { type: 'key'; key: string }
  | { type: 'method'; method: PaymentMethod }
  | { type: 'exact' }
  | { type: 'show-qr' | 'show-cash' }
  | { type: 'confirm'; index: number }
  | { type: 'unpaid' | 'confirm-unpaid' | 'back' | 'partial' | 'resume' };

export function createPreview(total: number): PreviewState {
  const cents = Math.round(total * 100);
  return {
    total: Number.isSafeInteger(cents) && cents > 0 ? cents : 0,
    step: 'options',
    split: false,
    method: 'cash',
    input: '',
    receivedInput: '',
    payments: [],
  };
}

export function inputAmount(input: string): number {
  const [whole = '0', decimal = ''] = input.split('.');
  return Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
}

export function remainingAmount(state: PreviewState): number {
  return state.total - state.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

export function cashChange(state: PreviewState): number {
  const due = state.split ? inputAmount(state.input) : state.total;
  const received = inputAmount(state.split ? state.receivedInput : state.input);
  return Math.max(0, received - due);
}

export function validEntry(state: PreviewState): boolean {
  const amount = inputAmount(state.input);
  if (state.step === 'cash') {
    return (
      state.split &&
      state.method === 'cash' &&
      amount > 0 &&
      amount <= remainingAmount(state) &&
      inputAmount(state.receivedInput) >= amount
    );
  }
  return (
    state.total > 0 &&
    (state.split ? amount > 0 && amount <= remainingAmount(state) : amount >= state.total)
  );
}

export function editAmount(input: string, key: string): string {
  if (key === 'delete') return input.slice(0, -1);
  if (key === '.') return input.includes('.') ? input : `${input || '0'}.`;
  if (!/^\d$/.test(key)) return input;
  const next = input === '0' ? key : input + key;
  const [whole, decimal = ''] = next.split('.');
  return whole.length <= 10 && decimal.length <= 2 ? next : input;
}

export function previewReducer(state: PreviewState, action: PreviewAction): PreviewState {
  switch (action.type) {
    case 'start':
      if (state.step !== 'options' || !state.total) return state;
      return {
        ...state,
        split: action.mode === 'split',
        method: action.mode === 'qr' ? 'qr' : 'cash',
        input: '',
        receivedInput: '',
        step: action.mode === 'qr' ? 'qr' : 'entry',
      };
    case 'key':
      if (state.step === 'cash')
        return { ...state, receivedInput: editAmount(state.receivedInput, action.key) };
      return state.step === 'entry'
        ? { ...state, input: editAmount(state.input, action.key) }
        : state;
    case 'method':
      return state.step === 'entry' && state.split ? { ...state, method: action.method } : state;
    case 'exact':
      if (state.step === 'cash')
        return { ...state, receivedInput: (inputAmount(state.input) / 100).toFixed(2) };
      return state.step === 'entry'
        ? { ...state, input: (remainingAmount(state) / 100).toFixed(2) }
        : state;
    case 'show-cash':
      return state.step === 'entry' && state.split && state.method === 'cash' && validEntry(state)
        ? { ...state, step: 'cash', receivedInput: '' }
        : state;
    case 'show-qr':
      return state.step === 'entry' && state.method === 'qr' && validEntry(state)
        ? { ...state, step: 'qr' }
        : state;
    case 'confirm': {
      // The rendered index also prevents a repeated tap from recording the same installment twice.
      if (action.index !== state.payments.length || !['entry', 'cash', 'qr'].includes(state.step))
        return state;
      if (state.split && state.method === 'cash' && state.step !== 'cash') return state;
      if (state.method === 'qr' && state.step !== 'qr') return state;
      if (!(state.step === 'qr' && !state.split) && !validEntry(state)) return state;
      const amount = state.split ? inputAmount(state.input) : state.total;
      if (amount <= 0) return state;
      const payments = [...state.payments, { method: state.method, amount }];
      return {
        ...state,
        payments,
        input: '',
        receivedInput: '',
        step: amount === remainingAmount(state) ? 'complete' : 'entry',
      };
    }
    case 'unpaid':
      return state.step === 'options' ? { ...state, step: 'unpaid' } : state;
    case 'confirm-unpaid':
      return state.step === 'unpaid' ? { ...state, step: 'unpaid-complete' } : state;
    case 'partial':
      return state.payments.length && remainingAmount(state) > 0
        ? { ...state, step: 'partial' }
        : state;
    case 'resume':
      return { ...state, step: 'entry' };
    case 'back':
      if (state.step === 'cash') return { ...state, step: 'entry', receivedInput: '' };
      if (state.step === 'partial') return { ...state, step: 'entry' };
      if (state.step === 'qr' && state.split) return { ...state, step: 'entry' };
      if (state.payments.length && remainingAmount(state) > 0) return { ...state, step: 'partial' };
      return { ...state, step: 'options', input: '' };
  }
}
