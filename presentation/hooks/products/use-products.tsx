import { useQuery } from '@tanstack/react-query';
import { getProductsPaginationAction } from '@/actions/products/get-products-pagination.action';

interface Options {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
  sort?: string;
  direction?: string;
}

export const useProducts = (options: Options) => {
  const { page = 1, limit = 10, direction, q, sort, status = 'ACTIVE' } = options;

  const query = useQuery({
    queryKey: ['products', { page, limit, direction, q, sort, status }],
    queryFn: () => getProductsPaginationAction({ page, limit, direction, q, sort, status }),
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
  };
};
