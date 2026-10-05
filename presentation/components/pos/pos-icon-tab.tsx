import { View, ColorValue } from 'react-native';

import { Icon } from '@/components/ui/icon';

import { type LucideIcon } from 'lucide-react-native';

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
    <View className="h-full w-10 items-center justify-center">
      {focused && <View className="absolute -top-2 h-1 w-10 rounded-b-full bg-primary" />}
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
