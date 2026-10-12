import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ImageIcon, Minus, Plus, Trash2 } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
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

/**
 * Fila de artículo en el carrito de compras del POS.
 * Fiel a la referencia visual: codex/references/screens/cart-screen.jpeg
 * Incorpora la miniatura con insignia circular de cantidad superpuesta (ej. '3', '7').
 */
export function CartItemRow({ item, disabled, onQuantityChange, onRemove }: Props) {
  const [showControls, setShowControls] = useState(false);

  return (
    <View className="mb-2 rounded-2xl bg-card border border-border/50 p-3.5">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setShowControls((prev) => !prev)}
        className="flex-row items-center justify-between gap-3">
        {/* Contenedor de miniatura con insignia de cantidad en la esquina superior derecha */}
        <View className="relative">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-secondary/80 border border-border/40">
            <Icon as={ImageIcon} size={22} className="text-muted-foreground/60" />
          </View>

          {/* Insignia de cantidad superpuesta - Referencia: cart-screen.jpeg */}
          <View className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] items-center justify-center rounded-full bg-foreground px-1.5 shadow-sm">
            <Text className="text-[11px] font-bold text-background leading-none">
              {item.quantity}
            </Text>
          </View>
        </View>

        {/* Detalles del producto */}
        <View className="flex-1 justify-center gap-1">
          <Text numberOfLines={1} className="text-base font-semibold text-foreground">
            {item.title}
          </Text>

          {/* Píldora de tipo de artículo - Referencia: cart-screen.jpeg */}
          <View className="self-start rounded-md bg-secondary/70 px-2 py-0.5">
            <Text className="text-xs font-medium text-muted-foreground">
              Artículo del menú
            </Text>
          </View>
        </View>

        {/* Precio total de la línea */}
        <View className="items-end justify-center">
          <Text className="text-base font-bold text-foreground">
            {Formatter.currency(item.unitPrice * item.quantity)}
          </Text>
          {item.quantity > 1 && (
            <Text className="text-xs text-muted-foreground">
              {Formatter.currency(item.unitPrice)} c/u
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Controles de ajuste de cantidad expandibles (o siempre disponibles al interactuar) */}
      <View className="mt-3 flex-row items-center justify-between border-t border-border/40 pt-2.5">
        <View className="flex-row items-center rounded-xl bg-secondary/60 p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            disabled={disabled || item.quantity <= 1}
            accessibilityLabel={`Reducir cantidad de ${item.title}`}
            onPress={() => onQuantityChange(item.productId, -1)}>
            <Icon as={Minus} size={15} className="text-foreground" />
          </Button>
          <Text
            className="min-w-8 text-center text-sm font-bold text-foreground"
            accessibilityLabel={`${item.quantity} unidades`}>
            {item.quantity}
          </Text>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            disabled={disabled || item.quantity >= 999}
            accessibilityLabel={`Aumentar cantidad de ${item.title}`}
            onPress={() => onQuantityChange(item.productId, 1)}>
            <Icon as={Plus} size={15} className="text-foreground" />
          </Button>
        </View>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 flex-row items-center gap-1.5"
          disabled={disabled}
          accessibilityLabel={`Eliminar ${item.title}`}
          onPress={() => onRemove(item.productId)}>
          <Icon as={Trash2} size={14} className="text-destructive" />
          <Text className="text-xs font-medium text-destructive">Quitar</Text>
        </Button>
      </View>
    </View>
  );
}