import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/presentation/components/shared/themed-view';
import { Text } from '@/components/ui/text';
import { useProduct } from '@/presentation/hooks/product/use-product';
import { ProductActions } from '@/presentation/components/product/product-actions';

import { Formatter } from '@/utils/formatter';

const ProductScreen = () => {
  const { id } = useLocalSearchParams();

  const { data: product, isLoading, isError } = useProduct(`${id || ''}`);

  if (isError) {
    return <Redirect href="/(pos)/(tabs)/products" />;
  }

  if (isLoading) {
    return <Text>Cargando...</Text>;
  }

  if (!product) {
    return <Redirect href="/(pos)/(tabs)/products" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
        }}
      />
      <ThemedView className="bg-card">
        <ScrollView className="px-4">
          <Text variant="h3" className="mb-6 mt-2">
            {product.title}
          </Text>
          <View className="gap-2">
            <Text className="text-muted-foreground">Inventario</Text>
            <Text className="text-base">
              {product.trackInventory
                ? `${product.inventoryQuantity} en existencia`
                : 'Cantidad sin seguimiento'}
            </Text>
          </View>
          <View className="mt-2 gap-2">
            <Text className="text-muted-foreground">Más detalles</Text>

            <View className="flex-row items-center justify-between">
              <Text className="text-base">Precio</Text>
              <Text className="text-base">{Formatter.currency(product.price)}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-base">Categoría</Text>
              <Text className="text-base capitalize">
                {product.category?.name || 'Sin asignación'}
              </Text>
            </View>
          </View>
        </ScrollView>
        <ProductActions key={product.id} />
      </ThemedView>
    </>
  );
};

export default ProductScreen;
