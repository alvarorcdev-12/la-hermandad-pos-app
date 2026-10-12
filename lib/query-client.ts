import { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/presentation/stores/auth.store';

export const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

useAuthStore.subscribe((state, previous) => {
  if (
    state.user?.id !== previous.user?.id ||
    state.user?.storeName !== previous.user?.storeName ||
    (state.authStatus === 'not-authenticated' && previous.authStatus !== 'not-authenticated')
  ) {
    const sensitive = {
      predicate: (query: { queryKey: readonly unknown[] }) =>
        ['checkout', 'orders', 'customers', 'products', 'product'].includes(
          String(query.queryKey[0])
        ),
    };
    void queryClient.cancelQueries(sensitive);
    queryClient.removeQueries(sensitive);
    queryClient.getMutationCache().clear();
  }
});
