import { FlatList, View } from 'react-native';
import { Link } from 'expo-router';

import { EllipsisIcon, Trash2Icon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { CartItemRow } from '@/presentation/components/cart/cart-item-row';
import { CartSummary } from '@/presentation/components/cart/cart-summary';

import { useCartStore } from '@/presentation/stores/cart.store';

const CartScreen = () => {
  const cart = useCartStore((state) => state.cart);

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
          <Button variant="ghost" size="icon" disabled={isEmptyCart()} onPress={clearCart}>
            <Icon as={Trash2Icon} size={18} />
          </Button>
        </View>
      </View>
      <View className="mt-4">
        <Link href="/(pos)/customers">
          <Text className="text-primary-emphasis">Agregar cliente</Text>
        </Link>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
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
        <CartSummary count={itemCount} subtotal={subtotalPrice} total={totalPrice} />
      )}
    </ThemedView>
  );
};

export default CartScreen;
