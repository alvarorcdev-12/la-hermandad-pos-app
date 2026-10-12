export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customerId?: string;
  email?: string;
  phone?: string;
  note?: string;
  items: CreateOrderItem[];
}
