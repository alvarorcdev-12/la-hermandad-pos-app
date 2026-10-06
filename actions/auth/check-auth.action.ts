import { laHermandadApi } from '@/infrastructure/api/la-hermandad-api';
import { SecureStorageAdapter } from '@/infrastructure/adapters/secure-storage.adapter';

import type { AuthResponse } from '@/infrastructure/interfaces/auth-response.interface';

export const checkAuthAction = async (): Promise<AuthResponse> => {
  const token = await SecureStorageAdapter.getItem('token');
  if (!token) {
    throw new Error('Token no encontrado');
  }
  try {
    const { data } = await laHermandadApi.get<AuthResponse>('/auth/check-status');
    return data;
  } catch (error) {
    console.log({ error });
    throw new Error('Token expirado o no valido');
  }
};
