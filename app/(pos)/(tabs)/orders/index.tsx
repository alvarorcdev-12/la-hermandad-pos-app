import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { useOrders } from '@/presentation/hooks/orders/use-orders';
import { useCartStore } from '@/presentation/stores/cart.store';
import { Formatter } from '@/utils/formatter';

const financialLabels: Record<string, string> = {
  PENDING: 'Sin pagar',
  PARTIALLY_PAID: 'Parcialmente pagado',
  PAID: 'Pagado',
  VOIDED: 'Anulado',
  REFUNDED: 'Reembolsado',
  PARTIALLY_REFUNDED: 'Reembolso parcial',
};
export default function OrdersScreen() {
  const [page, setPage] = useState(1);
  const orders = useOrders(page);
  const activeOrder = useCartStore((s) => s.orderId);
  const toCart = () => router.navigate('/(pos)/(tabs)/cart');
  return (
    <ThemedView safe className="bg-background">
      <Text variant="h1" className="mb-4 text-2xl">
        Pedidos
      </Text>
      <Alert
        visible={!!orders.errorMessage}
        title="No se pudo retomar el pedido"
        message={orders.errorMessage}
        variant="error"
        onClose={orders.dismissError}
      />
      {orders.isError && (
        <View className="gap-2 pb-4">
          <Text>No se pudieron actualizar los pedidos.</Text>
          <Button variant="outline" onPress={() => orders.refetch()}>
            <Text>Reintentar</Text>
          </Button>
        </View>
      )}
      <FlatList
        data={orders.data?.results ?? []}
        keyExtractor={(item) => item.id}
        refreshing={orders.isFetching}
        onRefresh={() => orders.refetch()}
        ListEmptyComponent={
          <Text>{orders.isPending ? 'Cargando pedidos…' : 'No hay pedidos en esta página.'}</Text>
        }
        renderItem={({ item }) => (
          <View className="gap-2 border-b border-border py-4">
            <View className="flex-row justify-between gap-2">
              <Text className="font-semibold">{item.name}</Text>
              <Text>{Formatter.currency(Number(item.totalPrice))}</Text>
            </View>
            <Text className="text-sm text-muted-foreground" selectable>
              {item.id}
            </Text>
            <Text>
              {financialLabels[item.financialStatus] ?? 'Estado financiero no reconocido'}
            </Text>
            {item.customer && (
              <Text>
                {[item.customer.firstName, item.customer.lastName].filter(Boolean).join(' ')}
              </Text>
            )}
          </View>
        )}
      />
      <View className="flex-row items-center justify-between gap-2 pt-3">
        <Button
          variant="ghost"
          disabled={page === 1 || orders.isFetching}
          onPress={() => setPage(page - 1)}>
          <Text>Anterior</Text>
        </Button>
        <Text>Página {page}</Text>
        <Button
          variant="ghost"
          disabled={!orders.data?.meta.hasNextPage || orders.isFetching}
          onPress={() => setPage(page + 1)}>
          <Text>Siguiente</Text>
        </Button>
      </View>
    </ThemedView>
  );
}
