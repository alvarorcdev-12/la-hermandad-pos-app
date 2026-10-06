import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, type TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { useAuthStore } from '@/presentation/stores/auth.store';

const LoginScreen = () => {
  const login = useAuthStore((state) => state.login);

  const [isViewPassword, setIsViewPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const passwordRef = useRef<TextInput>(null);

  const onLogin = async () => {
    const { email, password } = loginForm;

    if (!email || !password) {
      return;
    }

    setIsPending(true);

    const isAuthenticated = await login(email, password);

    setIsPending(false);

    if (isAuthenticated) {
      router.replace('/(pos)/(tabs)/(home)');
      return;
    }

    // TODO: Manejo de error
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'height' : undefined}>
      <ScrollView>
        <ThemedView className="bg-background px-4">
          <View className="mt-40 flex-1 gap-6">
            <View className="gap-1">
              <Text variant="h1" className="text-3xl">
                Bienvenido de nuevo
              </Text>
              <Text variant="muted" className="text-center text-base">
                Ingresa tus credenciales para continuar
              </Text>
            </View>
            <View className="gap-2">
              <Label className="text-base" nativeID="email-label" htmlFor="email">
                Correo electrónico
              </Label>
              <Input
                nativeID="email"
                accessibilityLabel="Correo electrónico"
                accessibilityLabelledBy="email-label"
                placeholder="nombre@ejemplo.com"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                submitBehavior="submit"
                value={loginForm.email}
                onChangeText={(email) => setLoginForm({ ...loginForm, email })}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
            <View className="gap-2">
              <Label className="text-base" nativeID="password-label" htmlFor="password">
                Contraseña
              </Label>
              <View className="relative">
                <Input
                  ref={passwordRef}
                  nativeID="password"
                  accessibilityLabel="Contraseña"
                  accessibilityLabelledBy="password-label"
                  className="pr-16"
                  secureTextEntry={!isViewPassword}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  textContentType="password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  value={loginForm.password}
                  onChangeText={(password) => setLoginForm({ ...loginForm, password })}
                />
                <View className="absolute right-0 top-0 h-full items-center justify-center pr-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    hitSlop={6}
                    accessibilityLabel={
                      isViewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    accessibilityState={{ checked: isViewPassword }}
                    onPress={() => setIsViewPassword((visible) => !visible)}>
                    <Icon
                      as={isViewPassword ? EyeOffIcon : EyeIcon}
                      size={20}
                      className="text-muted-foreground"
                    />
                  </Button>
                </View>
              </View>
            </View>
            <Button className="h-14 sm:h-14" onPress={onLogin}>
              <Text className="text-lg font-semibold">Iniciar sesión</Text>
            </Button>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
