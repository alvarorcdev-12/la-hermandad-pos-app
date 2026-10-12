import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Clock, FileText, RefreshCw, User } from 'lucide-react-native';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ScreenState } from '@/presentation/components/shared/screen-state';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { useOrders } from '@/presentation/hooks/orders/use-orders';
import { Formatter } from '@/utils/formatter';

const financialLabels: Record<string, { label: string; badgeClass: string; textClass: string }> = {
  PAID: {
    label: 'Pagado',
    badgeClass: 'bg-emerald-500/10 border-emerald-500/30',
    textClass: 'text-emerald-500',
  },
  PENDING: {
    label: 'Sin pagar',
    badgeClass: 'bg-amber-500/10 border-amber-500/30',
    textClass: 'text-amber-500',
  },
  PARTIALLY_PAID: {
    label: 'Parcial',
    badgeClass: 'bg-blue-500/10 border-blue-500/30',
    textClass: 'text-blue-500',
  },
  VOIDED: {
    label: 'Anulado',
    badgeClass: 'bg-muted border-border',
    textClass: 'text-muted-foreground',
  },
  REFUNDED: {
    label: 'Reembolsado',
    badgeClass: 'bg-destructive/10 border-destructive/30',
    textClass: 'text-destructive',
  },
  PARTIALLY_REFUNDED: {
    label: 'Reembolso parcial',
    badgeClass: 'bg-destructive/10 border-destructive/30',
    textClass: 'text-destructive',
  },
};

export default function OrdersScreen() {
  const [page, setPage] = useState(1);
  const orders = useOrders(page);

  return (
    <ThemedView safe className="flex-1 bg-background">
      {/* Encabezado */}
      <View className="flex-row items-center justify-between pb-3 pt-2">
        <Text className="text-3xl font-bold tracking-tight text-foreground">Pedidos</Text>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full"
          accessibilityLabel="Refrescar lista de pedidos"
          disabled={orders.isFetching}
          onPress={() => orders.refetch()}>
          <Icon
            as={RefreshCw}
            size={18}
            className={orders.isFetching ? 'text-primary' : 'text-foreground'}
          />
        </Button>
      </View>

      <Alert
        visible={!!orders.errorMessage}
        title="No se pudo retomar el pedido"
        message={orders.errorMessage}
        variant="error"
        onClose={orders.dismissError}
      />

      {orders.isError && (
        <View className="mb-3 gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
          <Text className="text-sm font-medium text-destructive">
            No se pudieron actualizar los pedidos recientes.
          </Text>
          <Button
            variant="outline"
            size="sm"
            className="self-start rounded-xl"
            onPress={() => orders.refetch()}>
            <Text className="text-xs font-semibold">Reintentar</Text>
          </Button>
        </View>
      )}

      <FlatList
        data={orders.data?.results ?? []}
        keyExtractor={(item) => item.id}
        refreshing={orders.isFetching}
        onRefresh={() => orders.refetch()}
        contentContainerClassName="pb-20 pt-1"
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <View className="pt-12">
            <ScreenState
              icon={FileText}
              title={orders.isPending ? 'Cargando pedidos…' : 'Sin pedidos registrados'}
              description={
                orders.isPending
                  ? 'Obteniendo historial de órdenes del servidor…'
                  : 'Aún no hay órdenes registradas en esta página.'
              }
            />
          </View>
        }
        renderItem={({ item }) => {
          const statusConfig = financialLabels[item.financialStatus] ?? {
            label: 'No reconocido',
            badgeClass: 'bg-secondary border-border',
            textClass: 'text-foreground',
          };
          const customerName = item.customer
            ? [item.customer.firstName, item.customer.lastName].filter(Boolean).join(' ')
            : null;

          return (
            <View className="gap-2.5 rounded-2xl border border-border/60 bg-card p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-bold text-foreground">
                    {item.name || `Orden #${item.id.slice(-6)}`}
                  </Text>
                  <View className={`rounded-full border px-2.5 py-0.5 ${statusConfig.badgeClass}`}>
                    <Text className={`text-[11px] font-semibold ${statusConfig.textClass}`}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>
                <Text className="text-base font-bold text-foreground">
                  {Formatter.currency(Number(item.totalPrice))}
                </Text>
              </View>

              <View className="flex-row items-center justify-between border-t border-border/40 pt-1">
                <Text className="font-mono text-xs text-muted-foreground" numberOfLines={1}>
                  ID: {item.id.slice(0, 14)}…
                </Text>

                {customerName ? (
                  <View className="flex-row items-center gap-1.5">
                    <Icon as={User} size={13} className="text-muted-foreground" />
                    <Text className="text-xs font-medium text-muted-foreground">
                      {customerName}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-xs text-muted-foreground">Cliente anónimo</Text>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Barra de paginación */}
      <View className="flex-row items-center justify-between border-t border-border/60 bg-card px-5 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="flex-row items-center gap-1 rounded-xl"
          disabled={page === 1 || orders.isFetching}
          onPress={() => setPage((p) => p - 1)}>
          <Icon as={ChevronLeft} size={16} />
          <Text className="text-xs font-semibold">Anterior</Text>
        </Button>

        <Text className="text-xs font-semibold text-muted-foreground">Página {page}</Text>

        <Button
          variant="ghost"
          size="sm"
          className="flex-row items-center gap-1 rounded-xl"
          disabled={!orders.data?.meta.hasNextPage || orders.isFetching}
          onPress={() => setPage((p) => p + 1)}>
          <Text className="text-xs font-semibold">Siguiente</Text>
          <Icon as={ChevronRight} size={16} />
        </Button>
      </View>
    </ThemedView>
  );
}
