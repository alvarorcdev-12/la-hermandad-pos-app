import { Stack } from 'expo-router';
import { View } from 'react-native';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { Button } from '@/components/ui/button';

const SaveButton = () => {
  return (
    <Button size="sm" variant="ghost" disabled>
      <Text className="text-primary">Guardar</Text>
    </Button>
  );
};

const NewCustomer = () => {
  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerRight: SaveButton,
        }}
      />
      <ThemedView className="px-4 dark:bg-card">
        <Text className="mb-4 mt-2 text-2xl font-semibold">Agregar cliente</Text>
        <Text className="mb-2 text-muted-foreground">Información de contacto</Text>
        <View className="gap-2">
          <View className="gap-2">
            <Label>Nombre</Label>
            <Input />
          </View>
          <View className="gap-2">
            <Label>Apellido</Label>
            <Input />
          </View>
          <View className="gap-2">
            <Label>Correo electrónico</Label>
            <Input />
          </View>
          <View className="gap-2">
            <Label>Numero de teléfono</Label>
            <Input />
          </View>
        </View>
      </ThemedView>
    </>
  );
};

export default NewCustomer;
