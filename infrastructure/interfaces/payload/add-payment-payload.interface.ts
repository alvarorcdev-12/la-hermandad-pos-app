export interface AddPaymentPayload {
  orderId: string;
  amount: number;
  method: 'CASH' | 'QR';
}
