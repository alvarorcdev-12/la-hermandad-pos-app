export interface CartItem {
  productId: string;
  title: string;
  unitPrice: number;
  quantity: number;
  image?: string;
}

export interface CartCustomer {
  name: string;
  acceptsMarketing: boolean;
}
