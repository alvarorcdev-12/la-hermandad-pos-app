import type { CartCustomer, CartItem } from '@/domain/entities/cart.entity';

export const cartCustomer: CartCustomer = {
  name: 'Álvaro Ruiz',
  acceptsMarketing: false,
};

export const cartItems: CartItem[] = [
  {
    productId: 'demo-beef',
    title: 'Empanada de carne',
    unitPrice: 4.5,
    quantity: 3,
  },
  {
    productId: 'demo-chicken',
    title: 'Empanada de pollo',
    unitPrice: 4.5,
    quantity: 7,
  },
];

export async function simulateCartPayment(): Promise<void> {
  // Simula la espera del pago sin realizar cobros ni registrar ventas.
  await new Promise((resolve) => setTimeout(resolve, 600));
}
