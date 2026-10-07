import { View, ActivityIndicator } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/presentation/stores/auth.store';
import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';

const PosLayout = () => {
  const { colorScheme } = useColorScheme();
  const authStatus = useAuthStore((state) => state.authStatus);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  const { isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: checkAuthStatus,
    refetchInterval: 1000 * 60 * 1.5,
  });

  if (authStatus === 'checking' || isLoading) {
    return (
      <View className="mb-2 flex-1 items-center justify-center gap-2 bg-background dark:bg-card">
        <ActivityIndicator color={THEME[colorScheme ?? 'light'].primaryEmphasis} size={20} />
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (authStatus === 'not-authenticated') {
    // Guardar la ruta del usuario
    return <Redirect href="/auth/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="customers"
        options={{
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
};

export default PosLayout;
