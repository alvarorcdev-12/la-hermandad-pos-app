import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { Link } from 'expo-router';
import { CircleAlertIcon, XIcon } from 'lucide-react-native';
import { View } from 'react-native';

const CustomersScreen = () => {
  return (
    <ThemedView safe className="bg-card">
      <View className="gap-4">
        <View className="flex-row items-center gap-2">
          <Link href="/(pos)/(tabs)/cart">
            <Icon as={XIcon} size={18} />
          </Link>
          <Input placeholder="Buscar cliente" className="w-[310px]" />
        </View>
        <Button size="lg" variant="secondary">
          <Text className="text-lg">Agregar cliente nuevo</Text>
        </Button>
      </View>
      <View className="flex-1 items-center justify-center gap-3">
        <Icon as={CircleAlertIcon} size={40} />
        <Text className="text-center text-lg font-semibold">
          Busca el correo, teléfono o nombre del cliente
        </Text>
      </View>
    </ThemedView>
  );
};

export default CustomersScreen;
