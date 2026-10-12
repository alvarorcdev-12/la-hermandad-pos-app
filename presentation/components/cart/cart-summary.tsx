import { ActivityIndicator, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { Formatter } from '@/utils/formatter';

type Props = {
  count: number;
  subtotal: number;
  total: number;
  processing?: boolean;
  error?: boolean;
  onCheckout?: () => void;
};

/**
 * Resumen de cobro en el carrito del POS.
 * Fiel a la referencia visual: codex/references/screens/cart-screen.jpeg
 */
export function CartSummary({
  count,
  subtotal,
  total,
  processing,
  error,
  onCheckout,
}: Props) {
  return (
    <View className="border-t border-border/60 bg-card px-5 pt-3.5 pb-6 gap-3">
      {/* Fila: Subtotal con conteo de artículos y desplegable - Referencia: cart-screen.jpeg */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-base font-medium text-foreground">
            Subtotal · {count} {count === 1 ? 'artículo' : 'artículos'}
          </Text>
          <Icon as={ChevronDown} size={16} className="text-muted-foreground" />
        </View>
        <Text className="text-base font-semibold text-foreground">
          {Formatter.currency(subtotal)}
        </Text>
      </View>

      {/* Fila: Impuestos - Referencia: cart-screen.jpeg */}
      {/* <View className="flex-row items-center justify-between">
        <Text className="text-base font-medium text-muted-foreground">Impuestos</Text>
        <Text className="text-base font-medium text-muted-foreground">
          {Formatter.currency(0)}
        </Text>
      </View> */}

      {error && (
        <Text accessibilityRole="alert" className="text-xs font-medium text-destructive">
          No se pudo completar el cobro. Intenta nuevamente.
        </Text>
      )}

      {/* Botón principal de cobro: Pagar BOB XX.XX - Referencia: cart-screen.jpeg */}
      <Button
        size="lg"
        variant="default"
        className="mt-1 h-14 rounded-2xl active:opacity-90 shadow-sm"
        disabled={!count || processing}
        onPress={onCheckout}
        accessibilityState={{ busy: processing, disabled: !count || processing }}
        accessibilityLabel={`Pagar ${Formatter.currency(total)}`}>
        {processing ? (
          <ActivityIndicator color={THEME.dark.primaryForeground} />
        ) : (
          <Text className="text-lg font-bold text-primary-foreground">
            Pagar {Formatter.currency(total)}
          </Text>
        )}
      </Button>
    </View>
  );
}
