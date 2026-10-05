import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ImageIcon } from 'lucide-react-native';

import { TouchableOpacity, View } from 'react-native';

export const ProductRow = () => {
  return (
    <TouchableOpacity className="flex-row items-center gap-3 py-3">
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-secondary">
        <Icon as={ImageIcon} className="text-muted-foreground" />
      </View>
      <View>
        <Text className="text-base font-semibold leading-6">Empanada de carne</Text>
        <Text className="font-semibold text-muted-foreground">B0B 5,00</Text>
      </View>
    </TouchableOpacity>
  );
};
