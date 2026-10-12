export const orderKeys = {
  scope: (userId?: string, storeName?: string) => ['orders', userId, storeName] as const,
  list: (userId: string | undefined, storeName: string | undefined, page: number) =>
    [...orderKeys.scope(userId, storeName), 'list', page] as const,
  detail: (userId: string | undefined, storeName: string | undefined, id: string) =>
    [...orderKeys.scope(userId, storeName), 'detail', id] as const,
};

export const checkoutKeys = {
  session: (userId: string | undefined, storeName: string | undefined, revision: number) =>
    ['checkout', userId, storeName, revision] as const,
};
