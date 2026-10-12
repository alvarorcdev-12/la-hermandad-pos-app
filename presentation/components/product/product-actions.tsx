import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { ShoppingCartIcon } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ActionBottomSheet } from '../shared/action-bottom-sheet';

import { useCartStore } from '@/presentation/stores/cart.store';

import type { Product } from '@/domain/entities/product.entity';

interface Props {
  product: Product;
}

export const ProductActions = ({ product }: Props) => {
  const locked = useCartStore((state) => state.locked);
  const addProductToCart = useCartStore((state) => state.addProductToCart);

  const [visible, setVisible] = useState(true);
  const [addedCount, setAddedCount] = useState(0);

  const openActions = () => {
    setAddedCount(0);
    setVisible(true);
  };

  const addToCart = () => {
    if (useCartStore.getState().locked) return;
    // const unitPrice = Number(product.price);
    // if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    //   setError(true);
    //   return;
    // }

    addProductToCart({
      productId: product.id,
      title: product.title,
      unitPrice: Number(product.price),
      quantity: 1,
    });
    // setError(false);
    setAddedCount((current) => current + 1);
  };

  const goToCart = () => {
    setVisible(false);
    setAddedCount(0);
    router.navigate('/(pos)/(tabs)/cart');
  };

  return (
    <>
      <View className="border-t border-border bg-card px-5 py-4">
        <Button size="lg" variant="secondary" onPress={openActions}>
          <Icon as={ShoppingCartIcon} size={21} />
          <Text>Acciones del producto</Text>
        </Button>
      </View>
      <ActionBottomSheet
        title="Acciones del producto"
        visible={visible}
        onClose={() => setVisible(false)}>
        <View className="gap-1">
          {locked && (
            <Text className="text-sm text-muted-foreground">
              Retoma el pedido registrado en el carrito antes de agregar productos.
            </Text>
          )}
          <Button disabled={locked} size="lg" variant="secondary" onPress={addToCart}>
            <Text>Agregar al carrito</Text>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            disabled={!locked && addedCount === 0}
            onPress={goToCart}>
            <Text>Ir al carrito ({`${addedCount} artículos`})</Text>
          </Button>
        </View>
      </ActionBottomSheet>
    </>
  );
};
