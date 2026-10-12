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

/**
 * Ícono de pestaña de navegación para POS móvil.
 * Muestra el indicador de foco activo y la insignia de conteo del carrito (Referencia: cart-screen.jpeg).
 */
const PosIconTab = ({ color, focused, icon, size = 20, isCart = false }: Props) => {
  const itemCount = useCartStore((state) =>
    state.cart.reduce((total, item) => total + item.quantity, 0)
  );

  return (
    <View className="h-full w-10 items-center justify-center relative">
      {/* Indicador de pestaña activa superior */}
      {focused && (
        <View className="absolute -top-1.5 h-1 w-8 rounded-b-full bg-primary" />
      )}

      {/* Insignia numérica de artículos en el carrito - Referencia: cart-screen.jpeg */}
      {isCart && itemCount > 0 && (
        <View className="absolute -top-1 -right-2 z-10 min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary px-1 shadow-sm">
          <Text className="text-[10px] font-bold text-primary-foreground leading-none">
            {itemCount > 99 ? '99+' : itemCount}
          </Text>
        </View>
      )}

      <Icon as={icon} size={19} color={color} />
    </View>
  );
};

export default PosIconTab;
