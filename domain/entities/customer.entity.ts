export interface Customer {
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
