import { ScrollView, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import {
  ArrowRight,
  LogOut,
  MoonStar,
  Package,
  Receipt,
  ShoppingCart,
  Sun,
  Users,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { HermandadLogo } from '@/presentation/components/shared/hermandad-logo';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { useCartStore } from '@/presentation/stores/cart.store';

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Button
      onPress={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="h-10 w-10 rounded-full"
      accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
      <Icon as={isDark ? MoonStar : Sun} size={20} className="text-foreground" />
    </Button>
  );
}

const HomeScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const itemCount = useCartStore((state) =>
    state.cart.reduce((total, item) => total + item.quantity, 0)
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <ThemedView safe className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pt-3 pb-24" showsVerticalScrollIndicator={false}>
        {/* Cabecera del POS con Marca y Acciones de Terminal */}
        <View className="flex-row items-center justify-between border-b border-border/40 pb-4">
          <HermandadLogo variant="horizontal" size={38} />
          <View className="flex-row items-center gap-1">
            <ThemeToggle />
            <Button
              onPress={handleLogout}
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full"
              accessibilityLabel="Bloquear / Cerrar sesión de terminal">
              <Icon as={LogOut} size={19} className="text-muted-foreground" />
            </Button>
          </View>
        </View>

        {/* Tarjeta de Estado del Terminal y Usuario Activo */}
        <View className="mt-5 gap-3 rounded-2xl border border-border/60 bg-card p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Terminal POS Activo
              </Text>
            </View>
            <View className="rounded-full bg-secondary/80 px-2.5 py-0.5">
              <Text className="text-xs font-medium text-foreground">{'Sucursal Principal'}</Text>
            </View>
          </View>

          <View className="gap-0.5">
            <Text className="text-xl font-bold text-foreground">{'Bienvenido al POS'}</Text>
            <Text className="text-xl font-bold text-foreground">{`${user?.name}`}</Text>
            <Text className="text-sm text-muted-foreground">
              Listo para registrar órdenes y cobros rápidos.
            </Text>
          </View>

          {/* Estado rápido del carrito si tiene artículos */}
          {itemCount > 0 && (
            <TouchableOpacity
              onPress={() => router.navigate('/(pos)/(tabs)/cart')}
              className="mt-1 flex-row items-center justify-between rounded-xl bg-primary/10 p-3 active:opacity-80">
              <View className="flex-row items-center gap-2.5">
                <Icon as={ShoppingCart} size={18} className="text-primary" />
                <Text className="text-sm font-semibold text-primary">
                  {itemCount} {itemCount === 1 ? 'artículo en curso' : 'artículos en curso'}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-sm font-bold text-primary">Ver carrito</Text>
                <Icon as={ArrowRight} size={16} className="text-primary" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Acciones Rápidas del POS (Estilo Shopify POS) */}
        <View className="mt-6 gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Acciones Rápidas
          </Text>

          <View className="gap-2.5">
            {/* Ir al Catálogo de Productos */}
            <TouchableOpacity
              onPress={() => router.navigate('/(pos)/(tabs)/products')}
              accessibilityRole="button"
              className="flex-row items-center justify-between rounded-2xl border border-border/60 bg-card p-4 active:bg-secondary/40">
              <View className="flex-1 flex-row items-center gap-3.5">
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <Icon as={Package} size={22} className="text-foreground" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">Catálogo de Productos</Text>
                  <Text className="text-xs text-muted-foreground">
                    Explora productos, inventario y añade al carrito
                  </Text>
                </View>
              </View>
              <Icon as={ArrowRight} size={18} className="text-muted-foreground/60" />
            </TouchableOpacity>

            {/* Ir a Clientes */}
            <TouchableOpacity
              onPress={() => router.navigate('/(pos)/customers')}
              accessibilityRole="button"
              className="flex-row items-center justify-between rounded-2xl border border-border/60 bg-card p-4 active:bg-secondary/40">
              <View className="flex-1 flex-row items-center gap-3.5">
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <Icon as={Users} size={22} className="text-foreground" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">Gestión de Clientes</Text>
                  <Text className="text-xs text-muted-foreground">
                    Selecciona o da de alta un cliente para la orden
                  </Text>
                </View>
              </View>
              <Icon as={ArrowRight} size={18} className="text-muted-foreground/60" />
            </TouchableOpacity>

            {/* Ir a Pedidos */}
            <TouchableOpacity
              onPress={() => router.navigate('/(pos)/(tabs)/orders')}
              accessibilityRole="button"
              className="flex-row items-center justify-between rounded-2xl border border-border/60 bg-card p-4 active:bg-secondary/40">
              <View className="flex-1 flex-row items-center gap-3.5">
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <Icon as={Receipt} size={22} className="text-foreground" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">Historial de Pedidos</Text>
                  <Text className="text-xs text-muted-foreground">
                    Revisa ventas anteriores y retoma cobros pendientes
                  </Text>
                </View>
              </View>
              <Icon as={ArrowRight} size={18} className="text-muted-foreground/60" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

export default HomeScreen;
