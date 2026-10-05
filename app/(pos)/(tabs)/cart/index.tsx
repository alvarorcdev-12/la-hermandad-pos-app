import { View } from 'react-native';
import { Link } from 'expo-router';

import { EllipsisIcon, Trash2Icon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { ThemedView } from '@/presentation/components/shared/themed-view';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

import { CartSummary } from '@/presentation/components/cart/cart-summary';

const CartScreen = () => {
  return (
    <ThemedView safe className="bg-card">
      <View className="flex-row items-center justify-between">
        <Text variant="h1" className="text-2xl">
          Carrito
        </Text>
        <View className="flex-row items-center gap-1">
          <Button variant="ghost" size="icon">
            <Icon as={EllipsisIcon} size={18} />
          </Button>
          <Button variant="ghost" size="icon" disabled>
            <Icon as={Trash2Icon} size={18} />
          </Button>
        </View>
      </View>
      <View className="mt-4">
        <Link href="/(pos)/customers">
          <Text className="text-primary">Agregar cliente</Text>
        </Link>
      </View>

      {/* Si esta vacio el carrito */}
      <View>
        <Button size="lg" disabled variant="secondary">
          <Text className="text-xl font-semibold">Pagar</Text>
        </Button>
      </View>
      {/* Si no estta vacio el carrito */}
      {/* <CartSummary
        count={1}
        subtotal={0}
        total={0}

        // processing={processing}
        // error={cart.status === 'error'}
        // onCheckout={cart.checkout}
      /> */}
    </ThemedView>
  );
};

export default CartScreen;
