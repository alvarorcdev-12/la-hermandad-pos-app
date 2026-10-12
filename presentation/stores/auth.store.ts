import { create } from 'zustand';
import { useCartStore } from './cart.store';
import { loginAction } from '@/actions/auth/login.action';
import { checkAuthAction } from '@/actions/auth/check-auth.action';

import { User } from '@/domain/entities/user.entity';
import { SecureStorageAdapter } from '@/infrastructure/adapters/secure-storage.adapter';
import { loginPosPinAction } from '@/actions/auth/login-pos-pin.action';

type AuthStatus = 'authenticated' | 'checking' | 'not-authenticated';

type AuthState = {
  user: User | null;
  token: string | null;
  authStatus: AuthStatus;

  // Getters
  isOwner: () => boolean;

  // Acciones
  login: (email: string, password: string) => Promise<boolean>;
  loginPin: (pin: string) => Promise<boolean>;
  checkAuthStatus: () => Promise<boolean>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  authStatus: 'checking',

  isOwner: () => {
    const { user } = get();
    return user?.isShopOwner || false;
  },

  login: async (email: string, password: string) => {
    try {
      const data = await loginAction(email, password);

      await SecureStorageAdapter.setItem('token', data.token);

      set({ user: data.user, token: data.token, authStatus: 'authenticated' });

      return true;
    } catch (error) {
      await SecureStorageAdapter.deleteItem('token');

      set({ user: null, token: null, authStatus: 'not-authenticated' });
      return false;
    }
  },
  loginPin: async (pin: string) => {
    try {
      const data = await loginPosPinAction(pin);

      await SecureStorageAdapter.setItem('token', data.token);

      set({ user: data.user, token: data.token, authStatus: 'authenticated' });

      return true;
    } catch (error) {
      await SecureStorageAdapter.deleteItem('token');

      set({ user: null, token: null, authStatus: 'not-authenticated' });
      return false;
    }
  },
  checkAuthStatus: async () => {
    try {
      const data = await checkAuthAction();
      await SecureStorageAdapter.setItem('token', data.token);
      set({ user: data.user, token: data.token, authStatus: 'authenticated' });

      return true;
    } catch (error) {
      await SecureStorageAdapter.deleteItem('token');

      set({ user: null, token: null, authStatus: 'not-authenticated' });
      return false;
    }
  },
  logout: async () => {
    await SecureStorageAdapter.deleteItem('token');
    set({ user: null, token: null, authStatus: 'not-authenticated' });
  },
}));

// La selección pertenece al usuario y la tienda de la sesión actual.
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id || state.authStatus === 'not-authenticated') {
    useCartStore.getState().resetSession();
  }
});
