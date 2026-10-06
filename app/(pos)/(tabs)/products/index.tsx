import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ArrowUpDownIcon, ChevronDownIcon } from 'lucide-react-native';
import { ProductRow } from '@/presentation/components/products/product-row';
import { DebounceSearchInput } from '@/presentation/components/shared/debounce-search-input';

import { useProducts } from '@/presentation/hooks/products/use-products';

const ProductsScreen = () => {
  const [query, setQuery] = useState('');

  const { data: products, isLoading } = useProducts({ page: 1, limit: 10, q: query });

  return (
    <ThemedView safe className="bg-card">
      <Button
        variant="ghost"
        className="h-auto min-h-11 justify-start gap-2 self-start p-0 active:bg-transparent">
        <Text variant="h1" className="text-2xl">
          Todos los productos
        </Text>
        <View className="h-6 w-8 items-center justify-center rounded-full bg-secondary">
          <Icon as={ChevronDownIcon} size={18} />
        </View>
      </Button>
      <View className="gap-3">
        {/* <Input placeholder="Buscar" /> */}
        <DebounceSearchInput placeholder="Buscar" onValueChange={setQuery} />
        <View className="flex-row items-start">
          <Button variant="secondary">
            <Icon as={ArrowUpDownIcon} size={18} />
            <Text>Ordenar</Text>
            <Icon as={ChevronDownIcon} size={18} />
          </Button>
        </View>
      </View>
      <FlatList
        className="mt-2"
        data={products || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductRow product={item} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </ThemedView>
  );
};

export default ProductsScreen;
