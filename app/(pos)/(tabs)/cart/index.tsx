import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Link } from 'expo-router';

import { EllipsisIcon, Trash2Icon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { CartItemRow } from '@/presentation/components/cart/cart-item-row';
import { CartSummary } from '@/presentation/components/cart/cart-summary';
import { PaymentPreview } from '@/presentation/components/payments/payment-preview';

import { useCartStore } from '@/presentation/stores/cart.store';

const CartScreen = () => {
  const [previewTotal, setPreviewTotal] = useState<number | null>(null);
  const locked = useCartStore((state) => state.locked);
  const orderId = useCartStore((state) => state.orderId);
  const cart = useCartStore((state) => state.cart);
  const selectedCustomer = useCartStore((state) => state.selectedCustomer);
  const clearSelectedCustomer = useCartStore((state) => state.clearSelectedCustomer);

  const isEmptyCart = useCartStore((state) => state.isEmpty);
  const getSummaryCart = useCartStore((state) => state.getSummaryCart);
  const updateCartItemQuantity = useCartStore((state) => state.updateCartItemQuantity);
  const removeCartItem = useCartStore((state) => state.removeCartItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const { itemCount, subtotalPrice, totalPrice } = getSummaryCart();

  return (
    <ThemedView safe className="bg-background dark:bg-card">
      <View className="flex-row items-center justify-between">
        <Text variant="h1" className="text-2xl">
          Carrito
        </Text>
        <View className="flex-row items-center gap-1">
          <Button variant="ghost" size="icon">
            <Icon as={EllipsisIcon} size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={locked || (isEmptyCart() && !selectedCustomer)}
            onPress={clearCart}>
            <Icon as={Trash2Icon} size={18} />
          </Button>
        </View>
      </View>
      <View className="mt-4">
        {selectedCustomer && (
          <Text className="text-lg font-semibold">{selectedCustomer.displayName}</Text>
        )}
        <View className="flex-row flex-wrap gap-2">
          <Link href="/(pos)/customers" asChild>
            <Button disabled={locked} variant="ghost" className="min-h-12 px-0">
              <Text className="text-primary-emphasis">
                {selectedCustomer ? 'Cambiar cliente' : 'Agregar cliente'}
              </Text>
            </Button>
          </Link>
          {selectedCustomer && (
            <Button
              disabled={locked}
              variant="ghost"
              className="min-h-12"
              onPress={clearSelectedCustomer}>
              <Text>Quitar cliente</Text>
            </Button>
          )}
        </View>
      </View>

      {locked && (
        <Text className="my-3 text-sm text-muted-foreground">
          {orderId
            ? `Pedido ${orderId}. Pulsa Pagar para retomar el cobro. Los productos y el cliente están bloqueados.`
            : 'Creación pendiente de verificación. Pulsa Pagar para revisar el resultado.'}
        </Text>
      )}
      <FlatList
        data={cart}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            disabled={locked}
            onQuantityChange={updateCartItemQuantity}
            onRemove={removeCartItem}
          />
        )}
        className="mt-5"
      />

      {isEmptyCart() ? (
        <View className="my-4">
          <Button size="lg" disabled variant="secondary">
            <Text className="text-lg font-semibold">Pagar</Text>
          </Button>
        </View>
      ) : (
        <CartSummary
          count={itemCount}
          subtotal={subtotalPrice}
          total={totalPrice}
          onCheckout={() => setPreviewTotal(totalPrice)}
        />
      )}
      {previewTotal !== null && (
        <PaymentPreview total={previewTotal} onClose={() => setPreviewTotal(null)} />
      )}
    </ThemedView>
  );
};

export default CartScreen;
