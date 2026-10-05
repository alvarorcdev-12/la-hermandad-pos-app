import { View } from 'react-native';
import { Stack } from 'expo-router';

import { ThemedView } from '@/presentation/components/shared/themed-view';
import { Text } from '@/components/ui/text';

const ProductScreen = () => {
  return (
    <>
      <Stack.Screen
        options={{
          title: '',
        }}
      />
      <ThemedView className="bg-card px-4">
        <Text variant="h3" className="mb-6 mt-2">
          Empanada de carne
        </Text>
        <View className="gap-2">
          <Text className="text-muted-foreground">Inventario</Text>
          <Text className="text-base">Cantidad sin seguimiento</Text>
        </View>
        <View className="mt-2 gap-2">
          <Text className="text-muted-foreground">Más detalles</Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-base">Precio de venta</Text>
            <Text className="text-base">BOB 10.00</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-base">Categoría</Text>
            <Text className="text-base">Empanada</Text>
          </View>
        </View>
      </ThemedView>
    </>
  );
};

export default ProductScreen;
