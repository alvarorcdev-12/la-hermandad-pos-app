import { View } from 'react-native';
import { ImageIcon, MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Formatter } from '@/utils/formatter';

import type { CartItem } from '@/domain/entities/cart.entity';

type Props = {
  item: CartItem;
  disabled?: boolean;
  onQuantityChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
};

export function CartItemRow({ item, disabled, onQuantityChange, onRemove }: Props) {
  return (
    <Card className="gap-3 p-4">
      <View className="flex-row items-start gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-xl bg-secondary">
          <Icon as={ImageIcon} size={16} className="text-muted-foreground" />
        </View>
        <View className="flex-1 gap-1">
          <Text className="font-semibold">{item.title}</Text>
          <Text className="text-sm text-muted-foreground">
            {Formatter.currency(item.unitPrice)}
          </Text>
        </View>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          accessibilityLabel={`Eliminar ${item.title}`}
          onPress={() => onRemove(item.productId)}>
          <Icon as={Trash2Icon} size={19} className="text-muted-foreground" />
        </Button>
      </View>
      <View className="flex-row flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <View className="flex-row items-center rounded-xl bg-secondary">
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled || item.quantity <= 1}
            accessibilityLabel={`Reducir cantidad de ${item.title}`}
            onPress={() => onQuantityChange(item.productId, -1)}>
            <Icon as={MinusIcon} size={18} />
          </Button>
          <Text
            className="min-w-8 text-center font-bold"
            accessibilityLabel={`${item.quantity} unidades`}>
            {item.quantity}
          </Text>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled || item.quantity >= 999}
            accessibilityLabel={`Aumentar cantidad de ${item.title}`}
            onPress={() => onQuantityChange(item.productId, 1)}>
            <Icon as={PlusIcon} size={18} />
          </Button>
        </View>
        <Text className="text-lg font-bold">
          {Formatter.currency(item.unitPrice * item.quantity)}
        </Text>
      </View>
    </Card>
  );
}