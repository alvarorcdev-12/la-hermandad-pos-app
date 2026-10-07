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

  clearCart: () => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  cart: [],
  selectedCustomer: null,
  setSelectedCustomer: ({ id, displayName }) => set({ selectedCustomer: { id, displayName } }),
  clearSelectedCustomer: () => set({ selectedCustomer: null }),

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
    const { cart } = get();

    const removeItem = cart.filter((item) => item.productId !== productId);

    set({ cart: removeItem });
  },

  clearCart: () => {
    set({ cart: [], selectedCustomer: null });
  },
}));
