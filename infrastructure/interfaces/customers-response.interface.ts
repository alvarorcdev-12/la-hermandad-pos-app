export interface CustomersDBResponse {
  meta: Meta;
  results: CustomerDB[];
}

export interface Meta {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CustomerDB {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  note: string | null;
  amountSpent: string;
  lastOrder: null;
  numberOfOrders: number;
  canDelete: boolean;
  createdAt: Date;
}
