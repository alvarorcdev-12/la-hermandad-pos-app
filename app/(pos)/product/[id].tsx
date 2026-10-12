import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Redirect, Stack, router, useLocalSearchParams } from 'expo-router';
import { ChevronRight, Package, X } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { ProductActions } from '@/presentation/components/product/product-actions';
import { useProduct } from '@/presentation/hooks/product/use-product';
import { Formatter } from '@/utils/formatter';

/**
 * Pantalla de detalle de producto para el POS móvil.
 * Basada fielmente en la referencia visual: codex/references/screens/product-detail.jpeg
 */
const ProductScreen = () => {
  const { id } = useLocalSearchParams();

  const { data: product, isLoading, isError } = useProduct(`${id || ''}`);

  if (isError) {
    return <Redirect href="/(pos)/(tabs)/products" />;
  }

  if (isLoading) {
    return (
      <ThemedView safe className="flex-1 items-center justify-center bg-background">
        <View className="items-center gap-3">
          <View className="h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-secondary/80">
            <Icon as={Package} size={28} className="text-muted-foreground/60" />
          </View>
          <Text className="text-sm font-medium text-muted-foreground">
            Cargando información del producto…
          </Text>
        </View>
      </ThemedView>
    );
  }

  if (!product) {
    return <Redirect href="/(pos)/(tabs)/products" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ThemedView safe className="flex-1 bg-background">
        {/* Barra superior con botón de cerrar (X) - Referencia: product-detail.jpeg */}
        <View className="flex-row items-center justify-between border-b border-border/40 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            accessibilityLabel="Cerrar detalle de producto"
            onPress={() => router.back()}>
            <Icon as={X} size={22} className="text-foreground" />
          </Button>
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Detalle del producto
          </Text>
          <View className="h-10 w-10" />
        </View>

        <ScrollView
          className="flex-1 pt-4"
          contentContainerClassName="pb-12"
          showsVerticalScrollIndicator={false}>
          {/* Título principal del producto */}
          <Text className="mb-6 text-3xl font-bold tracking-tight text-foreground">
            {product.title}
          </Text>

          {/* Sección: Inventario - Referencia: product-detail.jpeg */}
          <View className="mb-6 gap-3 rounded-2xl border border-border/60 bg-card p-4">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Inventario
            </Text>

            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">
                Abastecido en Sucursal de la tienda
              </Text>
              <Text className="text-sm font-medium text-muted-foreground">
                {product.trackInventory
                  ? `${product.inventoryQuantity} en existencia`
                  : 'Cantidad sin seguimiento'}
              </Text>
            </View>

            <View className="my-1 h-[1px] bg-border/40" />

            <Text className="text-xs text-muted-foreground">
              Última actualización el Hace un momento
            </Text>
          </View>

          {/* Sección: Más detalles - Referencia: product-detail.jpeg */}
          <View className="gap-3 rounded-2xl border border-border/60 bg-card p-4">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Más detalles
            </Text>

            {/* Fila: Precio */}
            <View className="flex-row items-center justify-between py-1">
              <Text className="text-base font-medium text-foreground">Precio</Text>
              <Text className="text-lg font-bold text-foreground">
                {Formatter.currency(product.price)}
              </Text>
            </View>

            <View className="h-[1px] bg-border/40" />

            {/* Fila: Proveedor / Categoría */}
            <TouchableOpacity
              className="flex-row items-center justify-between py-1 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel={`Categoría: ${product.category?.name || 'Sin asignación'}`}>
              <Text className="text-base font-medium text-foreground">Proveedor, categoría</Text>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm font-semibold capitalize text-muted-foreground">
                  {product.category?.name || 'Sin asignación'}
                </Text>
                <Icon as={ChevronRight} size={16} className="text-muted-foreground/60" />
              </View>
            </TouchableOpacity>

            {product.description && (
              <>
                <View className="h-[1px] bg-border/40" />
                <View className="gap-1 py-1">
                  <Text className="text-xs font-medium text-muted-foreground">Descripción</Text>
                  <Text className="text-sm leading-relaxed text-foreground/80">
                    {product.description}
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Barra inferior fija de acciones del producto */}
        <ProductActions key={product.id} product={product} />
      </ThemedView>
    </>
  );
};

export default ProductScreen;
