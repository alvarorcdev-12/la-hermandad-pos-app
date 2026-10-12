import { laHermandadApi } from '@/infrastructure/api/la-hermandad-api';
import type { AddPaymentResponse } from '@/infrastructure/interfaces/add-payment-response.interface';
import type { AddPaymentPayload } from '@/infrastructure/interfaces/payload/add-payment-payload.interface';

export const addPaymentAction = async (
  { orderId, amount, method }: AddPaymentPayload,
  token?: string
): Promise<AddPaymentResponse> => {
  const { data } = await laHermandadApi.post<AddPaymentResponse>(
    `/orders/${orderId}/payment`,
    { amount, method },
    { timeout: 20000, ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}) }
  );
  return data;
};
