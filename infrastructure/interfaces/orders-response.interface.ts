export interface OrderDB {
  id: string;
  number: number;
  name: string;
  itemCount: number;
  subtotalPrice: string;
  totalPrice: string;
  email: string | null;
  phone: string | null;
  note: string | null;
  financialStatus: string;
  status: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  closedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updateAt: string;
  items: Item[];
  customer: Customer | null;
}

export interface Customer {
  id: string;
  storeId: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  sku: string | null;
}
