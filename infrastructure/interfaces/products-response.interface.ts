export interface ProductsDBResponse {
  meta: Meta;
  results: ProductDB[];
}

export interface Meta {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductDB {
  id: string;
  title: string;
  description: string | null;
  sku: string | null;
  price: string;
  costPrice: string | null;
  compareAtPrice: string | null;
  trackInventory: boolean;
  inventoryQuantity: number;
  status: string;
  category: Category | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
}
