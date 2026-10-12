import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Ellipsis, ShoppingBag, Trash2, User, UserCheck, UserPlus } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CartItemRow } from '@/presentation/components/cart/cart-item-row';
import { CartSummary } from '@/presentation/components/cart/cart-summary';
import { PaymentPreview } from '@/presentation/components/payments/payment-preview';
import { ScreenState } from '@/presentation/components/shared/screen-state';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { useCartStore } from '@/presentation/stores/cart.store';

/**
 * Pantalla de Carrito de Compras para POS móvil.
 * Basada en la referencia visual: codex/references/screens/cart-screen.jpeg
 */
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
    <ThemedView safe className="flex-1 bg-background">
      {/* Barra superior: Título 'Carrito', opciones y vaciar carrito - Referencia: cart-screen.jpeg */}
      <View className="flex-row items-center justify-between pb-3 pt-2">
        <Text className="text-3xl font-bold tracking-tight text-foreground">Carrito</Text>
        <View className="flex-row items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            accessibilityLabel="Más opciones del carrito">
            <Icon as={Ellipsis} size={20} className="text-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            accessibilityLabel="Vaciar carrito"
            disabled={locked || (isEmptyCart() && !selectedCustomer)}
            onPress={clearCart}>
            <Icon
              as={Trash2}
              size={19}
              className={
                isEmptyCart() && !selectedCustomer ? 'text-muted-foreground/40' : 'text-foreground'
              }
            />
          </Button>
        </View>
      </View>

      {/* Sección del cliente - Referencia: cart-screen.jpeg */}
      <View className="mb-3 rounded-2xl border border-border/60 bg-card p-3.5">
        {selectedCustomer ? (
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Icon as={UserCheck} size={18} className="text-primary" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                  {selectedCustomer.displayName}
                </Text>
                <Text className="text-xs text-muted-foreground">No acepta marketing</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1">
              <Link href="/(pos)/customers" asChild>
                <Button disabled={locked} variant="ghost" size="sm" className="h-8 px-2.5">
                  <Text className="text-xs font-semibold text-primary">Cambiar</Text>
                </Button>
              </Link>
              <Button
                disabled={locked}
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onPress={clearSelectedCustomer}>
                <Text className="text-xs text-muted-foreground">Quitar</Text>
              </Button>
            </View>
          </View>
        ) : (
          <Link href="/(pos)/customers" asChild>
            <Button
              disabled={locked}
              variant="ghost"
              className="h-auto min-h-11 flex-row items-center justify-start gap-3 p-1">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
                <Icon as={UserPlus} size={18} className="text-muted-foreground" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Agregar cliente</Text>
                <Text className="text-xs text-muted-foreground">
                  Asigna esta venta a un cliente registrado
                </Text>
              </View>
            </Button>
          </Link>
        )}
      </View>

      {/* Alerta de bloqueo de orden */}
      {locked && (
        <View className="mx-5 mb-3 rounded-xl border border-border/40 bg-muted/60 p-3">
          <Text className="text-xs font-medium text-muted-foreground">
            {orderId
              ? `Pedido #${orderId}. Pulsa Pagar para continuar con el cobro. Los productos y el cliente están protegidos.`
              : 'Verificación en proceso. Pulsa Pagar para revisar el estado.'}
          </Text>
        </View>
      )}

      {/* Lista de productos en el carrito */}
      {isEmptyCart() ? (
        <View className="flex-1 items-center justify-center px-6 pb-12">
          <ScreenState
            icon={ShoppingBag}
            title="El carrito está vacío"
            description="Agrega productos desde el catálogo para iniciar una orden de venta en el POS."
          />
          <Button
            size="lg"
            variant="secondary"
            className="mt-2 rounded-2xl px-6"
            onPress={() => router.navigate('/(pos)/(tabs)/products')}>
            <Text className="text-base font-semibold">Ir al catálogo de productos</Text>
          </Button>
        </View>
      ) : (
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
          contentContainerClassName="pb-4"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Barra de resumen inferior y botón de pago - Referencia: cart-screen.jpeg */}
      {!isEmptyCart() && (
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
