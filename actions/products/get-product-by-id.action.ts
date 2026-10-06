import { laHermandadApi } from '@/infrastructure/api/la-hermandad-api';

import { ProductMapper } from '@/infrastructure/mappers/product.mapper';

import type { ProductDB } from '@/infrastructure/interfaces/products-response.interface';
import type { Product } from '@/domain/entities/product.entity';

export const getProductByIdAction = async (id: string): Promise<Product> => {
  if (!id) throw new Error('Id is required');

  try {
    const { data } = await laHermandadApi.get<ProductDB>(`/products/${id}`);
    return ProductMapper.toEntity(data);
  } catch (error) {
    console.log({ error });
    throw new Error(`Error getting product with ID: ${id}`);
  }
};
