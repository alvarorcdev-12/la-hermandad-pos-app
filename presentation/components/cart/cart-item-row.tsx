import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import { ImageIcon } from 'lucide-react-native';

import { View } from 'react-native';

export const CartItemRow = () => {
  return (
    <View className="flex-row gap-2 py-3">
      <View className="h-16 w-16 items-center justify-center rounded-lg bg-secondary">
        <Icon as={ImageIcon} size={18} className="text-muted-foreground" />
      </View>
      <View className="flex-1">
        <View className="flex-1 flex-row justify-between">
          <View>
            <Text className="text-lg font-semibold">Producto 1</Text>
            <Badge variant="secondary">
              <Text>BOB 5,00</Text>
            </Badge>
          </View>
          <Text className="text-lg font-semibold">BOB 10.00</Text>
        </View>
      </View>
    </View>
  );
};
