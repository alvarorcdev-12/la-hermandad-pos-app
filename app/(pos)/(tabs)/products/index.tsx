import { FlatList, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ArrowUpDownIcon, ChevronDownIcon } from 'lucide-react-native';
import { ProductRow } from '@/presentation/components/products/product-row';
import { useProducts } from '@/presentation/hooks/products/use-products';

const ProductsScreen = () => {
  const { data: products, isLoading } = useProducts({ page: 1, limit: 10 });

  return (
    <ThemedView safe className="bg-card">
      <Text variant="h1" className="text-2xl">
        Todos los productos
      </Text>
      <View className="gap-4">
        <Input placeholder="Buscar" />
        <Button variant="secondary" className="w-fit">
          <Icon as={ArrowUpDownIcon} size={18} />
          <Text>Ordenar</Text>
          <Icon as={ChevronDownIcon} size={18} />
        </Button>
      </View>
      <FlatList
        data={products || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductRow product={item} />}
      />
    </ThemedView>
  );
};

export default ProductsScreen;
