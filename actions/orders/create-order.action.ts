import { laHermandadApi } from '@/infrastructure/api/la-hermandad-api';
import type { OrderDB } from '@/infrastructure/interfaces/orders-response.interface';
import type { CreateOrderPayload } from '@/infrastructure/interfaces/payload/create-order-payload.interface';

export const createOrderAction = async (
  payload: CreateOrderPayload,
  token?: string
): Promise<OrderDB> => {
  const { data } = await laHermandadApi.post<OrderDB>('/orders', payload, {
    timeout: 20000,
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });
  return data;
};
