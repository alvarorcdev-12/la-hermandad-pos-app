import { View, ColorValue } from 'react-native';

import { Icon } from '@/components/ui/icon';

import { Text } from '@/components/ui/text';
// import { useCartStore } from '@/presentation/stores/cart.store';
import { type LucideIcon } from 'lucide-react-native';
import { THEME } from '@/lib/theme';

interface Props {
  icon: LucideIcon;
  focused: boolean;
  color: ColorValue;
  size: number;
  isCart?: boolean;
}

const PosIconTab = ({ color, focused, icon, size, isCart = false }: Props) => {
  // const cart = useCartStore((state) => state.cart);
  // const isEmptyCart = useCartStore((state) => state.isEmpty);
  return (
    <View className="h-full w-12 items-center justify-center">
      {focused && (
        <View
          className="absolute -top-3 h-1 w-12 rounded-b-full"
          style={{ backgroundColor: THEME['dark'].primary }}
        />
      )}
      {/* {isCart && !isEmptyCart() && (
        <View
          className="absolute -top-1 right-0 z-10 h-5 w-5 items-center justify-center bg-primary"
          style={{ borderRadius: '100%' }}>
          <Text className="text-center text-xs font-bold">{cart.length}</Text>
        </View>
      )} */}

      <Icon as={icon} size={20} color={color} />
    </View>
  );
};

export default PosIconTab;
