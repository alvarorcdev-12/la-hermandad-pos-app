import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, ImageIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Product } from '@/domain/entities/product.entity';
import { Formatter } from '@/utils/formatter';

interface Props {
  product: Product;
}

/**
 * Fila de producto optimizada para POS móvil.
 * Inspirada en el diseño de Shopify POS (codex/references/screens/products-screen.jpeg).
 */
export const ProductRow = ({ product }: Props) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, precio ${Formatter.currency(product.price)}`}
      className="flex-row items-center justify-between rounded-xl px-2 py-3 active:bg-secondary/40"
      onPress={() => router.push(`/(pos)/product/${product.id}`)}>
      <View className="flex-row items-center gap-3.5 flex-1 pr-2">
        {/* Miniatura cuadrada con bordes redondeados */}
        <View className="h-14 w-14 items-center justify-center rounded-xl bg-secondary/90 border border-border/50">
          <Icon as={ImageIcon} size={22} className="text-muted-foreground/70" />
        </View>

        {/* Información del producto: Nombre y Precio */}
        <View className="flex-1 justify-center gap-0.5">
          <Text
            numberOfLines={1}
            className="text-base font-semibold leading-snug text-foreground">
            {product.title}
          </Text>
          <Text className="text-sm font-medium text-muted-foreground">
            {Formatter.currency(product.price)}
          </Text>
        </View>
      </View>

      <Icon as={ChevronRight} size={18} className="text-muted-foreground/40" />
    </TouchableOpacity>
  );
};
