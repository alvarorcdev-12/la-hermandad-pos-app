import { laHermandadApi } from '@/infrastructure/api/la-hermandad-api';
import type { OrderDB } from '@/infrastructure/interfaces/orders-response.interface';

export async function getOrderAction(id: string, token?: string): Promise<OrderDB> {
  const { data } = await laHermandadApi.get<OrderDB>(`/orders/${id}`, {
    timeout: 15000,
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });
  return data;
}

export async function getOrdersAction(page: number) {
  const { data } = await laHermandadApi.get<{
    results: OrderDB[];
    meta: { hasNextPage: boolean; totalPages: number };
  }>('/orders', { params: { page, limit: 20 }, timeout: 15000 });
  return data;
}
