import { FlatList, View } from 'react-native';
import { Link, Stack } from 'expo-router';

import { CircleAlertIcon, XIcon } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { DebounceSearchInput } from '@/presentation/components/shared/debounce-search-input';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { useQuery } from '@tanstack/react-query';
import { getCustomersPaginationAction } from '@/actions/customers/get-customers-pagination.action';
import { useState } from 'react';

const CustomersScreen = () => {
  const [query, setQuery] = useState('');

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', { page: 1, limit: 10, q: query }],
    queryFn: () => getCustomersPaginationAction({ page: 1, limit: 10, q: query }),
  });

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <ThemedView className="bg-background px-4 dark:bg-card">
        <View className="mt-2 gap-4">
          <DebounceSearchInput placeholder="Buscar cliente" onValueChange={setQuery} />
          <Button size="lg" variant="secondary">
            <Text className="text-base">Agregar cliente nuevo</Text>
          </Button>
        </View>
        <FlatList
          className="flex-1"
          data={customers}
          keyExtractor={(customer) => customer.id}
          renderItem={({ item }) => (
            <View className="flex-row items-center gap-3 py-3">
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Text className="text-sm font-medium">AR</Text>
              </View>
              <Text>{item.displayName}</Text>
            </View>
          )}
        />
        {/* <View className="flex-1 items-center justify-center gap-3">
        <Icon as={CircleAlertIcon} size={40} />
        <Text className="text-center text-lg font-semibold">
          Busca el correo, teléfono o nombre del cliente
        </Text>
      </View> */}
      </ThemedView>
    </>
  );
};

export default CustomersScreen;
