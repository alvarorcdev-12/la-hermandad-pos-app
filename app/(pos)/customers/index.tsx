import { FlatList, TouchableOpacity, View } from 'react-native';
import { router, Stack } from 'expo-router';

import { CheckIcon } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { DebounceSearchInput } from '@/presentation/components/shared/debounce-search-input';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { useQuery } from '@tanstack/react-query';
import { getCustomersPaginationAction } from '@/actions/customers/get-customers-pagination.action';
import { useState } from 'react';
import { useCartStore } from '@/presentation/stores/cart.store';
import { useAuthStore } from '@/presentation/stores/auth.store';

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
    queryKey: ['customers', userId, storeName, { page: 1, limit: 10, q: query }],
    queryFn: () => getCustomersPaginationAction({ page: 1, limit: 10, q: query }),
  });

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <ThemedView className="bg-background px-4 pt-4 dark:bg-card">
        <View className="mt-2 gap-4">
          <DebounceSearchInput placeholder="Buscar cliente" onValueChange={setQuery} />
          <Button size="lg" variant="secondary" onPress={() => router.push('/(pos)/customer/new')}>
            <Text className="text-base">Agregar cliente nuevo</Text>
          </Button>
        </View>
        <FlatList
          className="flex-1"
          data={customers}
          ListEmptyComponent={
            <View className="items-center gap-3 py-12">
              <Text>
                {isLoading
                  ? 'Cargando clientes…'
                  : isError
                    ? 'No se pudieron cargar los clientes.'
                    : 'No se encontraron clientes.'}
              </Text>
              {isError && (
                <Button variant="secondary" onPress={() => refetch()}>
                  <Text>Reintentar</Text>
                </Button>
              )}
            </View>
          }
          keyExtractor={(customer) => customer.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="min-h-12 flex-row items-center gap-3 py-3"
              accessibilityRole="button"
              accessibilityLabel={`Seleccionar a ${item.displayName}`}
              accessibilityState={{ selected: selectedCustomerId === item.id }}
              onPress={() => {
                setSelectedCustomer(item);
                router.dismissTo('/(pos)/(tabs)/cart');
              }}>
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Text className="text-sm font-medium">
                  {item.displayName.trim().slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text className="flex-1">{item.displayName}</Text>
              {selectedCustomerId === item.id && <Icon as={CheckIcon} size={20} />}
            </TouchableOpacity>
          )}
        />
      </ThemedView>
    </>
  );
};

export default CustomersScreen;
