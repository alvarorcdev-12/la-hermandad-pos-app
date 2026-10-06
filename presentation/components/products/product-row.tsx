import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { ImageIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Product } from '@/domain/entities/product.entity';
import { Formatter } from '@/utils/formatter';

interface Props {
  product: Product;
}

export const ProductRow = ({ product }: Props) => {
  return (
    <TouchableOpacity
      className="flex-row items-center gap-3 py-3"
      onPress={() => router.push(`/(pos)/product/${product.id}`)}>
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-secondary">
        <Icon as={ImageIcon} className="text-muted-foreground" />
      </View>
      <View>
        <Text className="text-base font-semibold leading-6">{product.title}</Text>
        <Text className="font-semibold text-muted-foreground">
          {Formatter.currency(product.price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
