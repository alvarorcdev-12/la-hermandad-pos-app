import { Customer } from '@/domain/entities/customer.entity';
import { laHermandadApi } from '@/infrastructure/api/la-hermandad-api';
import { CustomersDBResponse } from '@/infrastructure/interfaces/customers-response.interface';
import { CustomerMapper } from '@/infrastructure/mappers/customer.mapper';

interface Options {
  page?: number;
  limit?: number;
  q?: string;

  sort?: string;
  direction?: string;
}

export const getCustomersPaginationAction = async (options: Options): Promise<Customer[]> => {
  const { page = 1, limit = 10, q, sort, direction } = options;

  try {
    const { data } = await laHermandadApi.get<CustomersDBResponse>('/customers', {
      params: {
        page,
        limit,
        q,
        sort,
        direction,
      },
    });

    return CustomerMapper.toEntityList(data.results);
  } catch (error) {
    console.log({ error });

    throw new Error('Error getting customers', { cause: error });
  }
};
