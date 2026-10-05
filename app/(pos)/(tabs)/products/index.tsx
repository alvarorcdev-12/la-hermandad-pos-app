import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ArrowUpDownIcon, ChevronDownIcon, ImageIcon } from 'lucide-react-native';

const ProductsScreen = () => {
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
    </ThemedView>
  );
};

export default ProductsScreen;
