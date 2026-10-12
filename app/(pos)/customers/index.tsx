import { useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { Check, ChevronLeft, Plus, User, UserPlus } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { DebounceSearchInput } from '@/presentation/components/shared/debounce-search-input';
import { ScreenState } from '@/presentation/components/shared/screen-state';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { getCustomersPaginationAction } from '@/actions/customers/get-customers-pagination.action';
import { useCartStore } from '@/presentation/stores/cart.store';
import { useAuthStore } from '@/presentation/stores/auth.store';

/**
 * Pantalla de selección de clientes para asignar a una venta POS.
 */
const CustomersScreen = () => {
  const [query, setQuery] = useState('');
  const selectedCustomerId = useCartStore((state) => state.selectedCustomer?.id);
  const setSelectedCustomer = useCartStore((state) => state.setSelectedCustomer);
  const userId = useAuthStore((state) => state.user?.id);
  const storeName = useAuthStore((state) => state.user?.storeName);

  const {
    data: customers,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['customers', userId, storeName, { page: 1, limit: 20, q: query }],
    queryFn: () => getCustomersPaginationAction({ page: 1, limit: 20, q: query }),
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ThemedView safe className="flex-1 bg-background">
        {/* Cabecera personalizada */}
        <View className="flex-row items-center justify-between px-4 pt-1 pb-3 border-b border-border/40">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            accessibilityLabel="Volver al carrito"
            onPress={() => router.back()}>
            <Icon as={ChevronLeft} size={24} className="text-foreground" />
          </Button>
          <Text className="text-lg font-bold text-foreground">
            Clientes
          </Text>
          <View className="h-10 w-10" />
        </View>

        <View className="px-5 pt-3 pb-2 gap-3">
          <DebounceSearchInput
            placeholder="Buscar por nombre o teléfono..."
            onValueChange={setQuery}
          />
          <Button
            size="lg"
            variant="secondary"
            className="h-12 rounded-xl flex-row items-center justify-center gap-2 active:bg-secondary/70 border border-border/50"
            onPress={() => router.push('/(pos)/customer/new')}>
            <Icon as={UserPlus} size={18} className="text-foreground" />
            <Text className="text-sm font-semibold text-foreground">
              Agregar cliente nuevo
            </Text>
          </Button>
        </View>

        {isLoading ? (
          <View className="px-5 pt-3 gap-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <View
                key={idx}
                className="flex-row items-center gap-3 rounded-2xl bg-card border border-border/40 p-3.5">
                <View className="h-11 w-11 rounded-full bg-secondary/70 animate-pulse" />
                <View className="flex-1 gap-1.5">
                  <View className="h-4 w-1/2 rounded bg-secondary/80 animate-pulse" />
                  <View className="h-3 w-1/3 rounded bg-secondary/50 animate-pulse" />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            className="flex-1"
            contentContainerClassName="px-5 pb-16 pt-2"
            data={customers || []}
            ItemSeparatorComponent={() => <View className="h-2" />}
            keyExtractor={(customer) => customer.id}
            ListEmptyComponent={
              <View className="pt-8">
                <ScreenState
                  icon={User}
                  title={query ? 'Sin resultados' : 'No hay clientes'}
                  description={
                    query
                      ? `No se encontró ningún cliente con el término "${query}".`
                      : 'Puedes crear un nuevo cliente para asociarlo a los pedidos de la tienda.'
                  }
                />
                {isError && (
                  <View className="items-center mt-3">
                    <Button variant="outline" size="sm" onPress={() => refetch()}>
                      <Text className="text-xs font-semibold">Reintentar carga</Text>
                    </Button>
                  </View>
                )}
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = selectedCustomerId === item.id;
              const initials = item.displayName.trim().slice(0, 2).toUpperCase();

              return (
                <TouchableOpacity
                  className={`flex-row items-center justify-between rounded-2xl border p-3.5 active:bg-secondary/40 ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border/60 bg-card'
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel={`Seleccionar a ${item.displayName}`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    setSelectedCustomer(item);
                    router.dismissTo('/(pos)/(tabs)/cart');
                  }}>
                  <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                    <View
                      className={`h-11 w-11 items-center justify-center rounded-full ${
                        isSelected ? 'bg-primary' : 'bg-secondary'
                      }`}>
                      <Text
                        className={`text-sm font-bold ${
                          isSelected ? 'text-primary-foreground' : 'text-foreground'
                        }`}>
                        {initials}
                      </Text>
                    </View>

                    <View className="flex-1 justify-center">
                      <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                        {item.displayName}
                      </Text>
                      {item.phone ? (
                        <Text className="text-xs text-muted-foreground">{item.phone}</Text>
                      ) : (
                        <Text className="text-xs text-muted-foreground">Cliente registrado</Text>
                      )}
                    </View>
                  </View>

                  {isSelected && (
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
                      <Icon as={Check} size={16} className="text-primary-foreground" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </ThemedView>
    </>
  );
};

export default CustomersScreen;
