import { laHermandadApi } from '@/infrastructure/api/la-hermandad-api';

import type { AuthResponse } from '@/infrastructure/interfaces/auth-response.interface';

export const loginAction = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data } = await laHermandadApi.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    return data;
  } catch (error) {
    console.log({ error });
    throw new Error('Credenciales incorrectas');
  }
};
