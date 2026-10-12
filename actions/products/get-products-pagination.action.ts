import { laHermandadApi } from '@/infrastructure/api/la-hermandad-api';

import { ProductMapper } from '@/infrastructure/mappers/product.mapper';

import type { ProductsDBResponse } from '@/infrastructure/interfaces/products-response.interface';
import type { Product } from '@/domain/entities/product.entity';

interface Options {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  sort?: string;
  direction?: string;
}

export const getProductsPaginationAction = async (options: Options): Promise<Product[]> => {
  // await sleep(1500);

  try {
    const { page, limit, q, status, sort, direction } = options;

    const { data } = await laHermandadApi.get<ProductsDBResponse>('/products', {
      params: {
        page,
        limit,
        q,
        status: status?.toUpperCase(),
        sort,
        direction,
      },
    });
    return ProductMapper.toEntityList(data.results);
  } catch (error) {
    console.log(JSON.stringify(error, null, 4));
    throw new Error('Error de obtener productos paginados');
  }
};
