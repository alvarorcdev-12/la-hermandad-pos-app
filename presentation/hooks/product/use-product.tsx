import { useQuery } from '@tanstack/react-query';

import { getProductByIdAction } from '@/actions/products/get-product-by-id.action';

export const useProduct = (id: string) => {
  const query = useQuery({
    queryKey: ['product', { id }],
    queryFn: () => getProductByIdAction(id),
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
  };
};
