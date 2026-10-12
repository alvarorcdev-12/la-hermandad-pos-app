import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { ArrowUpDown, ChevronDown, PackageSearch, Tag } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { DebounceSearchInput } from '@/presentation/components/shared/debounce-search-input';
import { ProductRow } from '@/presentation/components/products/product-row';
import { ScreenState } from '@/presentation/components/shared/screen-state';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { useProducts } from '@/presentation/hooks/products/use-products';

/**
 * Pantalla principal de catálogo de productos para el POS móvil.
 * Basada fielmente en la referencia visual: codex/references/screens/products-screen.jpeg
 */
const ProductsScreen = () => {
  const [query, setQuery] = useState('');

  const {
    data: products,
    isLoading,
    isFetching,
    refetch,
  } = useProducts({ page: 1, limit: 30, q: query });

  return (
    <ThemedView safe className="bg-background">
      <View className="gap-3.5 pb-3 pt-1">
        {/* Encabezado: Colección seleccionada con selector en píldora - Referencia: products-screen.jpeg */}
        <View className="flex-row items-center justify-between pt-1">
          <Button
            variant="ghost"
            className="h-auto min-h-10 flex-row items-center gap-2 self-start p-0 active:bg-transparent"
            accessibilityLabel="Selector de categoría de productos">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              Todos los productos
            </Text>
            <View className="h-6 w-7 items-center justify-center rounded-full bg-secondary">
              <Icon as={ChevronDown} size={16} className="text-foreground" />
            </View>
          </Button>
        </View>

        {/* Barra de Búsqueda con ícono de escaneo de código de barras - Referencia: products-screen.jpeg */}
        <DebounceSearchInput
          placeholder="Buscar producto o SKU..."
          showBarcode
          onValueChange={setQuery}
        />

        {/* Barra de Filtros y Ordenamiento */}
        <View className="flex-row items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-row items-center gap-1.5 rounded-xl border border-border/60 bg-secondary/80 px-3.5 py-2 active:bg-secondary"
            // onPress={toggleSort}
            accessibilityLabel="Ordenar productos">
            <Icon as={ArrowUpDown} size={15} className="text-foreground" />
            <Text className="text-xs font-semibold text-foreground">
              {/* {sortDirection === 'ASC' ? 'Ordenar A-Z' : 'Ordenar Z-A'} */}
            </Text>
            <Icon as={ChevronDown} size={14} className="text-muted-foreground" />
          </Button>
        </View>
      </View>

      {/* Lista de productos con estados de carga y vacío */}
      {isLoading ? (
        <View className="gap-3 px-4 pt-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <View key={idx} className="flex-row items-center gap-3.5 rounded-xl px-2 py-3">
              <View className="h-14 w-14 animate-pulse rounded-xl bg-secondary/60" />
              <View className="flex-1 gap-2">
                <View className="h-4 w-3/4 animate-pulse rounded bg-secondary/70" />
                <View className="h-3 w-1/3 animate-pulse rounded bg-secondary/50" />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          contentContainerClassName="pb-24"
          data={products || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductRow product={item} />}
          ItemSeparatorComponent={() => <View className="mx-2 h-[1px] bg-border/40" />}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor="#6366F1"
            />
          }
          ListEmptyComponent={
            <View className="pt-10">
              <ScreenState
                icon={query ? PackageSearch : Tag}
                title={query ? 'No se encontraron productos' : 'Catálogo vacío'}
                description={
                  query
                    ? `No hay coincidencias para "${query}". Intenta buscar con otro nombre.`
                    : 'No hay productos disponibles en esta sucursal por el momento.'
                }
              />
              {query.length > 0 && (
                <View className="mt-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onPress={() => setQuery('')}>
                    <Text className="text-xs font-semibold">Limpiar búsqueda</Text>
                  </Button>
                </View>
              )}
            </View>
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </ThemedView>
  );
};

export default ProductsScreen;
