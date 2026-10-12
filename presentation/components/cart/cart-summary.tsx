import { ActivityIndicator, View } from 'react-native';

import { Button } from '@/components/ui/button';
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

export function CartSummary({
  count,
  subtotal,

  total,
  processing,
  error,
  onCheckout,
}: Props) {
  return (
    <View className="gap-3 px-4 pb-4 pt-2">
      <Button variant="ghost" className="justify-between px-0">
        <Text className="text-sm">
          Subtotal · {count} {count === 1 ? 'artículo' : 'artículos'}
        </Text>
        <View className="flex-row items-center">
          <Text>{Formatter.currency(subtotal)}</Text>
        </View>
      </Button>

      {error && (
        <Text accessibilityRole="alert" className="text-sm text-destructive">
          No se pudo completar el cobro. Intenta nuevamente.
        </Text>
      )}
      <Button
        size="lg"
        disabled={!count || processing}
        onPress={onCheckout}
        accessibilityState={{ busy: processing, disabled: !count || processing }}>
        {processing && <ActivityIndicator color={THEME.dark.primaryForeground} />}
        <Text className="text-lg font-semibold">
          {processing ? 'Procesando…' : `Pagar ${Formatter.currency(total)}`}
        </Text>
      </Button>
    </View>
  );
}
