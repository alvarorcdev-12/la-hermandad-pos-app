import { View, type ColorValue } from 'react-native';
import { type LucideIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useCartStore } from '@/presentation/stores/cart.store';

interface Props {
  icon: LucideIcon;
  focused: boolean;
  color: ColorValue;
  size: number;
  isCart?: boolean;
}

const PosIconTab = ({ color, focused, icon, size = 20, isCart = false }: Props) => {
  const getSummary = useCartStore((state) => state.getSummaryCart);

  const { itemCount } = getSummary();

  return (
    <View className="relative h-full w-10 items-center justify-center">
      {focused && <View className="absolute -top-1.5 h-1 w-8 rounded-b-full bg-primary" />}

      {isCart && itemCount > 0 && (
        <View className="absolute -right-2 -top-1 z-10 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 shadow-sm">
          <Text className="text-[10px] font-bold leading-none text-primary-foreground">
            {itemCount > 99 ? '99+' : itemCount}
          </Text>
        </View>
      )}

      <Icon as={icon} size={19} color={color} />
    </View>
  );
};

export default PosIconTab;
