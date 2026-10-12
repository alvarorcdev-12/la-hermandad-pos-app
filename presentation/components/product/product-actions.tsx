import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Check, Plus, ShoppingBag } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useCartStore } from '@/presentation/stores/cart.store';
import type { Product } from '@/domain/entities/product.entity';

interface Props {
  product: Product;
}

/**
 * Barra de acciones de producto para POS móvil.
 * Basada en codex/references/screens/product-detail.jpeg
 */
export const ProductActions = ({ product }: Props) => {
  const locked = useCartStore((state) => state.locked);
  const addProductToCart = useCartStore((state) => state.addProductToCart);

  const [addedCount, setAddedCount] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const addToCart = () => {
    if (locked) return;

    addProductToCart({
      productId: product.id,
      title: product.title,
      unitPrice: Number(product.price),
      quantity: 1,
    });

    setAddedCount((current) => current + 1);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1500);
  };

  const goToCart = () => {
    router.navigate('/(pos)/(tabs)/cart');
  };

  return (
    <View className="gap-2.5 border-t border-border/80 bg-card pb-6 pt-3">
      {locked && (
        <Text className="text-center text-xs font-medium text-muted-foreground">
          Hay un cobro en curso. Retoma el pedido en el carrito para desbloquearlo.
        </Text>
      )}

      <View className="flex-row items-center gap-2.5">
        {/* Botón principal: Agregar al carrito */}
        <Button
          variant="secondary"
          disabled={locked}
          className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-2xl active:bg-secondary/70"
          onPress={addToCart}
          accessibilityLabel={`Agregar ${product.title} al carrito`}>
          <Icon
            as={justAdded ? Check : Plus}
            size={20}
            className={justAdded ? 'text-primary' : 'text-foreground'}
          />
          <Text className="text-base font-semibold text-foreground">
            {justAdded
              ? `¡Agregado! (${addedCount})`
              : addedCount > 0
                ? `Agregar otro (${addedCount})`
                : 'Agregar al carrito'}
          </Text>
        </Button>

        {/* Botón rápido para ir al carrito cuando se ha agregado al menos 1 artículo */}
        {addedCount > 0 && (
          <Button
            variant="default"
            className="h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5"
            onPress={goToCart}
            accessibilityLabel="Ir al carrito">
            <Icon as={ShoppingBag} size={18} className="text-primary-foreground" />
            <Text className="text-base font-semibold text-primary-foreground">Ver carrito</Text>
          </Button>
        )}
      </View>
    </View>
  );
};
