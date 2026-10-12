import { laHermandadApi } from '@/infrastructure/api/la-hermandad-api';
import { AuthResponse } from '@/infrastructure/interfaces/auth-response.interface';

export const loginPosPinAction = async (pin: string) => {
  const storeId = process.env.EXPO_PUBLIC_STORE_ID;

  if (!storeId) {
    throw new Error('storeId no encontrado en .env para la autenticación');
  }

  try {
    const { data } = await laHermandadApi.post<AuthResponse>('/auth/login-pin', {
      storeId,
      posPin: pin,
    });

    return data;
  } catch (error) {
    console.log({ error });
    throw new Error('Credenciales incorrectas');
  }
};
