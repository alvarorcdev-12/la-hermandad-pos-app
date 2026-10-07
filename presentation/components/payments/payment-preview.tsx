import { useReducer } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import {
  ArrowLeftIcon,
  BanknoteIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  LayersIcon,
  ScanLineIcon,
  QrCodeIcon,
  XIcon,
} from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  PaymentAmount,
  PaymentHistory,
  PaymentKeypad,
  PaymentMethodSelector,
  previewMoney,
} from './payment-preview-parts';
import {
  createPreview,
  cashChange,
  inputAmount,
  previewReducer,
  remainingAmount,
  validEntry,
} from './payment-preview-state';

const options = [
  {
    mode: 'cash',
    title: 'Efectivo',
    description: 'Introduce el importe recibido',
    icon: BanknoteIcon,
  },
  { mode: 'qr', title: 'QR', description: 'Verifica la recepción del importe', icon: QrCodeIcon },
  {
    mode: 'split',
    title: 'Pago dividido',
    description: 'Combina efectivo y QR en varios abonos',
    icon: LayersIcon,
  },
] as const;

/** Mounted per session; it has no access to stores, HTTP clients or persistence. */
export function PaymentPreview({ total, onClose }: { total: number; onClose: () => void }) {
  const [state, dispatch] = useReducer(previewReducer, total, createPreview);
  const insets = useSafeAreaInsets();
  const remaining = remainingAmount(state);
  const entered = inputAmount(state.input);
  const paid = state.total - remaining;
  const complete = state.step === 'complete';
  const finished = complete || state.step === 'unpaid-complete';
  const valid = validEntry(state);
  const cashEntry = state.step === 'cash' || !state.split;
  const editingAmount = state.step === 'entry' || state.step === 'cash';
  const cashDue = state.split ? entered : state.total;
  const cashInput = state.split ? state.receivedInput : state.input;
  const received = inputAmount(cashInput);
  const error = cashEntry
    ? cashInput && received < cashDue
      ? `Faltan ${previewMoney(cashDue - received)} para cubrir ${state.split ? 'el abono' : 'el total'}.`
      : null
    : entered > remaining
      ? 'El abono no puede superar el saldo pendiente.'
      : null;

  const close = () => {
    if (paid > 0 && remaining > 0 && state.step !== 'partial') dispatch({ type: 'partial' });
    else onClose();
  };
  const back = () => {
    if (state.step === 'options' || finished) onClose();
    else dispatch({ type: 'back' });
  };
  const confirm = () => dispatch({ type: 'confirm', index: state.payments.length });
  const title =
    state.step === 'options'
      ? 'Opciones de pago'
      : state.step === 'unpaid'
        ? 'Marcar como no pagado'
        : state.step === 'partial'
          ? 'Pago parcial'
          : finished
            ? 'Resumen de la simulación'
            : state.split
              ? `Pago ${state.payments.length + 1}`
              : state.method === 'cash'
                ? 'Pago en efectivo'
                : 'Pago por QR';

  return (
    <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={back}>
      <View
        className="flex-1 bg-background"
        accessibilityViewIsModal
        onAccessibilityEscape={close}
        style={{
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 12),
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}>
        <View className="mx-auto w-full max-w-lg flex-1">
          <View className="flex-row items-center gap-2 px-4 py-2">
            {state.step !== 'options' && !finished && (
              <Button
                variant="ghost"
                className="h-12 w-12"
                accessibilityLabel="Volver"
                onPress={back}>
                <Icon as={ArrowLeftIcon} size={22} />
              </Button>
            )}
            <Text accessibilityRole="header" className="flex-1 text-lg font-semibold">
              {title}
            </Text>
            <Button
              variant="ghost"
              className="h-12 w-12"
              accessibilityLabel="Cerrar vista previa de pagos"
              onPress={close}>
              <Icon as={XIcon} size={22} />
            </Button>
          </View>
          <Text className="px-4 pb-2 text-center text-xs text-muted-foreground">
            Vista previa · sin registro de pagos
          </Text>

          <ScrollView
            key={state.step}
            bounces={false}
            contentContainerClassName="grow px-5 pb-5"
            keyboardShouldPersistTaps="handled">
            <Animated.View
              key={`${state.step}-${state.payments.length}`}
              entering={FadeIn.duration(160).reduceMotion(ReduceMotion.System)}
              className={editingAmount ? 'flex-1 gap-2' : 'flex-1 gap-4'}>
              {state.step === 'options' && (
                <>
                  <View className="flex-1 justify-center py-4">
                    <PaymentAmount
                      label="Total a cobrar"
                      amount={state.total}
                      detail="Elige cómo recibir el pago"
                    />
                  </View>
                  <View className="gap-3">
                    {options.map((option) => (
                      <Button
                        key={option.mode}
                        variant="outline"
                        className="h-auto min-h-20 justify-start gap-4 rounded-xl bg-card p-4"
                        disabled={!state.total}
                        onPress={() => dispatch({ type: 'start', mode: option.mode })}>
                        <View className="rounded-xl bg-accent p-3">
                          <Icon as={option.icon} size={24} className="text-primary-emphasis" />
                        </View>
                        <View className="flex-1 gap-1">
                          <Text className="text-base font-semibold">{option.title}</Text>
                          <Text className="text-sm text-muted-foreground">
                            {option.description}
                          </Text>
                        </View>
                        <Icon as={ChevronRightIcon} size={18} className="text-muted-foreground" />
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      className="h-auto min-h-16 justify-start gap-4 px-4 py-3"
                      onPress={() => dispatch({ type: 'unpaid' })}>
                      <Icon as={ClockIcon} size={22} className="text-muted-foreground" />
                      <Text className="flex-1">Marcar como no pagado</Text>
                      <Icon as={ChevronRightIcon} size={18} />
                    </Button>
                  </View>
                  {!state.total && (
                    <Text
                      accessibilityRole="alert"
                      className="text-center text-sm text-destructive">
                      No hay un importe válido para simular el pago.
                    </Text>
                  )}
                  <Text className="pb-2 text-center text-xs text-muted-foreground">
                    Al salir se descarta la simulación. Tu carrito se conserva.
                  </Text>
                </>
              )}

              {editingAmount && (
                <>
                  <PaymentAmount
                    compact
                    label={state.split ? 'Importe del abono' : 'Importe a cobrar'}
                    amount={state.split ? entered : state.total}
                    detail={state.split ? `Saldo pendiente ${previewMoney(remaining)}` : undefined}
                  />
                  {state.split && state.step === 'entry' && (
                    <PaymentMethodSelector
                      method={state.method}
                      onChange={(method) => dispatch({ type: 'method', method })}
                    />
                  )}
                  {cashEntry && (
                    <View className="gap-2 rounded-xl border border-border bg-card p-3">
                      <View className="flex-row items-center justify-between gap-3">
                        <Text className="flex-1 text-sm text-muted-foreground">
                          {state.split ? 'Efectivo recibido' : 'Importe recibido'}
                        </Text>
                        <Text
                          accessibilityLiveRegion="polite"
                          accessibilityLabel={`Efectivo recibido: ${cashInput || '0'}`}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          className="flex-1 text-right text-3xl font-semibold text-primary-emphasis">
                          {(cashInput || '0').replace('.', ',')}
                        </Text>
                      </View>
                      <View className="flex-row flex-wrap justify-between gap-2 border-t border-border pt-2">
                        <Text className="text-sm text-muted-foreground">Cambio simulado</Text>
                        <Text className="font-semibold">{previewMoney(cashChange(state))}</Text>
                      </View>
                    </View>
                  )}
                  <View className="flex-row items-center justify-between gap-2">
                    <Text
                      accessibilityLiveRegion="polite"
                      className="flex-1 text-sm text-muted-foreground">
                      {!cashEntry
                        ? `Entrada: ${(state.input || '0').replace('.', ',')}`
                        : 'Hasta 2 decimales'}
                    </Text>
                    <Button
                      variant="ghost"
                      className="h-auto min-h-12 shrink px-2 py-2"
                      onPress={() => dispatch({ type: 'exact' })}>
                      <Text className="text-sm text-primary-emphasis">
                        {cashEntry ? 'Usar importe exacto' : 'Usar saldo pendiente'}
                      </Text>
                    </Button>
                  </View>
                  <PaymentKeypad onKey={(key) => dispatch({ type: 'key', key })} />
                  {error && (
                    <Text accessibilityRole="alert" className="text-sm text-destructive">
                      {error}
                    </Text>
                  )}
                  {state.split && state.step === 'entry' && (
                    <Text className="text-center text-xs text-muted-foreground">
                      {state.method === 'cash'
                        ? 'En el siguiente paso introduce el efectivo recibido y revisa el cambio.'
                        : 'En el siguiente paso verás el espacio para el QR de este abono.'}
                    </Text>
                  )}
                  <PaymentHistory payments={state.payments} />
                </>
              )}

              {state.step === 'qr' && (
                <>
                  <PaymentAmount
                    compact
                    label="Importe que se espera recibir"
                    amount={state.split ? entered : state.total}
                    detail={
                      state.split
                        ? `Abono por QR · saldo actual ${previewMoney(remaining)}`
                        : 'Pago directo por QR'
                    }
                  />
                  <View className="w-full max-w-48 self-center">
                    <View
                      className="aspect-square items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted p-3"
                      accessible
                      accessibilityLabel="Espacio reservado para QR. No disponible en esta vista previa.">
                      <Icon as={ScanLineIcon} size={40} className="text-muted-foreground" />
                      <Text className="text-center font-semibold">Espacio para QR</Text>
                      <Text className="text-center text-sm text-muted-foreground">
                        Placeholder · no válido para realizar pagos
                      </Text>
                    </View>
                  </View>
                  <View className="gap-2 rounded-xl bg-accent p-4">
                    <Text className="font-semibold text-accent-foreground">
                      Verifica antes de confirmar
                    </Text>
                    <Text className="text-sm leading-6 text-accent-foreground">
                      Verifica la recepción de {previewMoney(state.split ? entered : state.total)}.
                      Aquí solo simulas ese paso.
                    </Text>
                  </View>
                  <PaymentHistory payments={state.payments} />
                </>
              )}

              {(finished || state.step === 'unpaid' || state.step === 'partial') && (
                <>
                  <View className="items-center gap-3 pt-4">
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
                      <Icon
                        as={complete ? CheckIcon : ClockIcon}
                        size={36}
                        className="text-primary-emphasis"
                      />
                    </View>
                    <Text accessibilityRole="header" className="text-center text-2xl font-bold">
                      {complete
                        ? 'Pago completo simulado'
                        : state.step === 'unpaid-complete'
                          ? 'No pagado · simulado'
                          : state.step === 'partial'
                            ? 'Queda un saldo pendiente'
                            : '¿Dejar el total pendiente?'}
                    </Text>
                    <Text className="text-center leading-6 text-muted-foreground">
                      {complete
                        ? 'Recorrido completado. No se ha registrado ningún cobro.'
                        : state.step === 'unpaid-complete'
                          ? 'Así se vería una venta sin pago. No se ha guardado ningún cambio.'
                          : state.step === 'partial'
                            ? 'Puedes seguir con los abonos o descartar la simulación y volver al carrito.'
                            : 'Esta opción representa una venta sin pago. En esta vista previa solo cambia la pantalla.'}
                    </Text>
                  </View>
                  <PaymentAmount
                    compact
                    label={complete ? 'Total simulado' : 'Saldo pendiente'}
                    amount={complete ? paid : remaining}
                  />
                  {state.step === 'partial' && (
                    <View className="flex-row flex-wrap justify-between gap-2 rounded-xl bg-accent p-4">
                      <Text className="text-accent-foreground">Importe abonado</Text>
                      <Text className="font-semibold text-accent-foreground">
                        {previewMoney(paid)}
                      </Text>
                    </View>
                  )}
                  <PaymentHistory payments={state.payments} />
                  <Text className="text-center text-sm leading-6 text-muted-foreground">
                    {state.step === 'partial'
                      ? 'El carrito real queda intacto. Los abonos de esta vista previa no se guardan para más tarde.'
                      : 'Al volver, los productos y el cliente del carrito seguirán intactos.'}
                  </Text>
                </>
              )}
            </Animated.View>
          </ScrollView>

          {state.step !== 'options' && (
            <View className="gap-2 border-t border-border bg-background px-5 pt-3">
              {state.step === 'partial' && (
                <Text className="text-center text-xs text-muted-foreground">
                  Al salir se descartan los abonos simulados.
                </Text>
              )}
              <Button
                className="h-auto min-h-14 py-3"
                disabled={editingAmount && !valid}
                accessibilityState={{ disabled: editingAmount && !valid }}
                onPress={() => {
                  if (finished) onClose();
                  else if (state.step === 'partial') dispatch({ type: 'resume' });
                  else if (state.step === 'unpaid') dispatch({ type: 'confirm-unpaid' });
                  else if (state.step === 'entry' && state.method === 'qr')
                    dispatch({ type: 'show-qr' });
                  else if (state.step === 'entry' && state.split) dispatch({ type: 'show-cash' });
                  else confirm();
                }}>
                <Text className="flex-shrink text-center text-base font-semibold">
                  {finished
                    ? 'Volver al carrito'
                    : state.step === 'partial'
                      ? 'Seguir con los abonos'
                      : state.step === 'unpaid'
                        ? 'Confirmar como no pagado'
                        : state.step === 'qr'
                          ? 'Confirmar recepción'
                          : state.method === 'qr'
                            ? 'Continuar al QR'
                            : state.split
                              ? state.step === 'entry'
                                ? 'Continuar con efectivo'
                                : 'Confirmar abono'
                              : 'Confirmar pago'}
                </Text>
              </Button>
              {!finished && (
                <Button
                  variant="ghost"
                  className="h-auto min-h-12 py-3"
                  onPress={state.step === 'partial' ? onClose : back}>
                  <Text>{state.step === 'partial' ? 'Continuar después' : 'Volver'}</Text>
                </Button>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
