import { View } from 'react-native';
import { BanknoteIcon, DeleteIcon, QrCodeIcon } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Formatter } from '@/utils/formatter';
import type { PaymentMethod, PreviewPayment } from './payment-preview-state';

export const previewMoney = (cents: number) => Formatter.currency(cents / 100);

export function PaymentAmount({
  label,
  amount,
  detail,
  compact = false,
}: {
  label: string;
  amount: number;
  detail?: string;
  compact?: boolean;
}) {
  return (
    <View className={cn('items-center gap-2', compact ? 'py-2' : 'py-6')}>
      <Text className="text-center text-sm font-medium text-muted-foreground">{label}</Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        className="w-full text-center text-4xl font-bold tracking-tight"
        accessibilityLabel={`${label}: ${previewMoney(amount)}`}>
        {previewMoney(amount)}
      </Text>
      {detail && <Text className="text-center text-sm text-muted-foreground">{detail}</Text>}
    </View>
  );
}

export function PaymentMethodSelector({
  method,
  onChange,
}: {
  method: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <View className="flex-row gap-2 rounded-xl bg-muted p-1">
      {(['cash', 'qr'] as const).map((value) => (
        <Button
          key={value}
          variant={method === value ? 'default' : 'ghost'}
          className="h-auto min-h-12 flex-1 py-3"
          accessibilityState={{ selected: method === value }}
          onPress={() => onChange(value)}>
          <Icon as={value === 'cash' ? BanknoteIcon : QrCodeIcon} size={20} />
          <Text>{value === 'cash' ? 'Efectivo' : 'QR'}</Text>
        </Button>
      ))}
    </View>
  );
}

export function PaymentKeypad({ onKey }: { onKey: (key: string) => void }) {
  return (
    <View className="gap-2" accessibilityLabel="Teclado de importes">
      {[
        ['7', '8', '9'],
        ['4', '5', '6'],
        ['1', '2', '3'],
        ['.', '0', 'delete'],
      ].map((row, index) => (
        <View key={index} className="flex-row gap-2">
          {row.map((key) => (
            <Button
              key={key}
              variant="ghost"
              className="h-auto min-h-12 flex-1 rounded-xl bg-muted py-2"
              accessibilityLabel={
                key === 'delete' ? 'Borrar último dígito' : key === '.' ? 'Separador decimal' : key
              }
              onPress={() => onKey(key)}>
              {key === 'delete' ? (
                <Icon as={DeleteIcon} size={24} />
              ) : (
                <Text className="text-2xl font-medium">{key === '.' ? ',' : key}</Text>
              )}
            </Button>
          ))}
        </View>
      ))}
    </View>
  );
}

export function PaymentHistory({ payments }: { payments: PreviewPayment[] }) {
  if (!payments.length) return null;
  return (
    <View className="gap-2 rounded-xl border border-border bg-card p-4">
      <Text className="text-sm font-semibold">Abonos registrados · {payments.length}</Text>
      {payments.map((payment, index) => (
        <View key={index} className="flex-row flex-wrap justify-between gap-2">
          <Text className="text-sm text-muted-foreground">
            {index + 1}. {payment.method === 'cash' ? 'Efectivo' : 'QR'}
          </Text>
          <Text className="text-sm font-medium">{previewMoney(payment.amount)}</Text>
        </View>
      ))}
    </View>
  );
}
