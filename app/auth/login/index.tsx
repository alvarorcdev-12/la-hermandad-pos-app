import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, ChevronLeft, Lock } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { HermandadLogo } from '@/presentation/components/shared/hermandad-logo';
import { useAuthStore } from '@/presentation/stores/auth.store';

const DIGIT_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

const MAX_PIN_LENGTH = 8;

const LoginScreen = () => {
  const loginPin = useAuthStore((state) => state.loginPin);
  const [pin, setPin] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { width, fontScale } = useWindowDimensions();

  // Dimensión de las teclas circulares manteniendo ergonomía táctil (mínimo 56dp, máx 76dp)
  const diameter = Math.max(56, Math.min(76, (width - 100) / 3));
  const keyStyle = {
    width: diameter,
    height: diameter,
    minHeight: diameter * Math.max(1, fontScale),
  };

  const addDigit = (digit: string) => {
    if (isPending) return;
    if (errorMessage) setErrorMessage(null);
    setPin((value) => (value + digit).slice(0, MAX_PIN_LENGTH));
  };

  const removeDigit = () => {
    if (isPending) return;
    if (errorMessage) setErrorMessage(null);
    setPin((value) => value.slice(0, -1));
  };

  const onLogin = async () => {
    if (!pin || pin.length < 4 || isPending) {
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    const isAuthenticated = await loginPin(pin);

    setIsPending(false);

    if (isAuthenticated) {
      router.replace('/(pos)/(tabs)/(home)');
      return;
    }

    setErrorMessage('PIN incorrecto. Intenta nuevamente.');
    setPin('');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerClassName="flex-grow justify-between px-6 py-8"
        bounces={false}
        keyboardShouldPersistTaps="handled">
        <ThemedView className="flex-1 justify-between bg-transparent">
          {/* Encabezado de la tienda - Referencia: auth.jpeg */}
          <View className="items-center pt-8">
            <Text className="text-center text-3xl font-bold tracking-tight text-foreground">
              La Hermandad
            </Text>
            <Text className="mt-1 text-center text-base text-muted-foreground">
              Sucursal de la tienda
            </Text>
          </View>

          {/* Sección central: Ícono de bloqueo, prompt y puntos PIN */}
          <View className="my-6 items-center">
            <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-secondary/80">
              <Icon as={Lock} size={22} className="text-foreground" />
            </View>

            <Text className="mb-4 text-center text-base font-medium text-foreground">
              Ingresa el PIN
            </Text>

            {/* Indicador de dígitos como estaba antes */}
            <View className="h-9 items-center justify-center">
              <Text
                accessibilityLiveRegion="polite"
                accessibilityLabel={`${pin.length} dígitos ingresados`}
                className="text-center text-2xl tracking-widest text-foreground font-semibold">
                {'•'.repeat(pin.length)}
              </Text>
            </View>

            {/* Mensaje de error discreto y accesible */}
            {errorMessage && (
              <View className="mt-2 rounded-lg bg-destructive/10 px-3 py-1.5">
                <Text accessibilityRole="alert" className="text-xs font-medium text-destructive">
                  {errorMessage}
                </Text>
              </View>
            )}
          </View>

          {/* Teclado numérico ergonómico - Referencia: auth.jpeg */}
          <View className="items-center gap-4">
            {DIGIT_ROWS.map((row) => (
              <View key={row.join('')} className="flex-row gap-6">
                {row.map((digit) => (
                  <Button
                    key={digit}
                    variant="secondary"
                    className="items-center justify-center rounded-full p-0 shadow-none active:bg-secondary/70"
                    style={keyStyle}
                    accessibilityLabel={digit}
                    disabled={isPending}
                    onPress={() => addDigit(digit)}>
                    <Text className="text-3xl font-semibold text-foreground">{digit}</Text>
                  </Button>
                ))}
              </View>
            ))}

            {/* Fila inferior: Borrar, 0, Confirmar/Acceder */}
            <View className="flex-row gap-6">
              <Button
                variant="secondary"
                className="items-center justify-center rounded-full p-0 shadow-none active:bg-secondary/70"
                style={keyStyle}
                accessibilityLabel="Borrar último dígito"
                disabled={!pin.length || isPending}
                onPress={removeDigit}>
                <Icon as={ChevronLeft} size={28} className="text-foreground" />
              </Button>

              <Button
                variant="secondary"
                className="items-center justify-center rounded-full p-0 shadow-none active:bg-secondary/70"
                style={keyStyle}
                accessibilityLabel="0"
                disabled={isPending}
                onPress={() => addDigit('0')}>
                <Text className="text-3xl font-semibold text-foreground">0</Text>
              </Button>

              <Button
                variant={pin.length >= 4 ? 'default' : 'secondary'}
                className="items-center justify-center rounded-full p-0 shadow-none active:opacity-90"
                style={keyStyle}
                accessibilityLabel="Iniciar sesión con PIN"
                onPress={onLogin}
                disabled={pin.length < 4 || isPending}>
                {isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Icon
                    as={ArrowRight}
                    size={28}
                    className={pin.length >= 4 ? 'text-primary-foreground' : 'text-muted-foreground'}
                  />
                )}
              </Button>
            </View>
          </View>

          {/* Logotipo distintivo inferior - Referencia: auth.jpeg (marca de tienda) */}
          <View className="mt-8 items-center justify-center pb-2">
            <HermandadLogo size={34} variant="mark" />
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
