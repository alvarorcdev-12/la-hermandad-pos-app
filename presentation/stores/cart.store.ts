import { create } from 'zustand';

import type { Customer } from '@/domain/entities/customer.entity';
import type { CartItem } from '@/domain/entities/cart.entity';

interface CartState {
  // Properties
  cart: CartItem[];
  selectedCustomer: Pick<Customer, 'id' | 'displayName'> | null;
  setSelectedCustomer: (customer: Pick<Customer, 'id' | 'displayName'>) => void;
  clearSelectedCustomer: () => void;

  // Getters
  isEmpty: () => boolean;
  getSummaryCart: () => { totalPrice: number; subtotalPrice: number; itemCount: number };

  // Methods
  addProductToCart: (cartItem: CartItem) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeCartItem: (productId: string) => void;

  locked: boolean;
  pending: boolean;
  orderId: string | null;
  revision: number;
  beginCheckout: () => boolean;
  endCheckout: (locked: boolean) => void;
  attachOrder: (id: string) => void;
  restoreOrder: (id: string, cart: CartItem[], customer: CartState['selectedCustomer']) => void;
  finishCheckout: () => void;
  resetSession: () => void;

  clearCart: () => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  locked: false,
  pending: false,
  orderId: null,
  revision: 0,
  beginCheckout: () => {
    if (get().pending) return false;
    set({ pending: true, locked: true });
    return true;
  },
  endCheckout: (locked) => set({ pending: false, locked }),
  attachOrder: (orderId) => set({ orderId, locked: true }),
  restoreOrder: (orderId, cart, selectedCustomer) =>
    set({ orderId, cart, selectedCustomer, locked: true }),
  finishCheckout: () =>
    set({
      cart: [],
      selectedCustomer: null,
      orderId: null,
      locked: false,
      pending: false,
      revision: get().revision + 1,
    }),
  resetSession: () => get().finishCheckout(),
  cart: [],
  selectedCustomer: null,
  setSelectedCustomer: ({ id, displayName }) => {
    if (!get().locked) set({ selectedCustomer: { id, displayName } });
  },
  clearSelectedCustomer: () => {
    if (!get().locked) set({ selectedCustomer: null });
  },

  isEmpty: () => {
    const { cart } = get();

    return !cart || cart.length === 0;
  },

  getSummaryCart: () => {
    const { cart } = get();

    let itemCount = 0;
    let subtotal = 0;

    for (const item of cart) {
      itemCount += item.quantity;
      subtotal += item.unitPrice * item.quantity;
    }

    return {
      itemCount: itemCount,
      subtotalPrice: subtotal,
      totalPrice: subtotal,
    };
  },

  addProductToCart: (cartItem: CartItem) => {
    if (get().locked) return;
    const { cart } = get();

    const productInCart = cart.some((c) => c.productId === cartItem.productId);

    if (!productInCart) {
      set({ cart: [...cart, cartItem] });
      return;
    }

    const updatedCartProducts = cart.map((item) => {
      if (item.productId === cartItem.productId) {
        return {
          ...item,
          quantity: item.quantity + cartItem.quantity,
        };
      }

      return item;
    });

    set({ cart: updatedCartProducts });
  },

  updateCartItemQuantity: (productId: string, quantity: number) => {
    if (get().locked) return;
    const { cart } = get();

    const updateCart = cart.map((item) => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: item.quantity + quantity,
        };
      }

      return item;
    });

    set({ cart: updateCart });
  },

  removeCartItem: (productId: string) => {
    if (get().locked) return;
    const { cart } = get();

    const removeItem = cart.filter((item) => item.productId !== productId);

    set({ cart: removeItem });
  },

  clearCart: () => {
    if (!get().locked) get().finishCheckout();
  },
}));
