import { THEME } from '@/lib/theme';
import PosIconTab from '@/presentation/components/pos/pos-icon-tab';
import { Tabs } from 'expo-router';
import { HomeIcon, InboxIcon, ShoppingCartIcon, TagIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  return (
    <Tabs
      initialRouteName="(home)/index"
      backBehavior="none"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME[colorScheme ?? 'light'].foreground,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          // backgroundColor: THEME[colorScheme ?? 'light'].background,
          backgroundColor: colorScheme === 'light' ? THEME.light.card : THEME.dark.background,
          paddingBottom: insets.bottom + 8,
        },
        tabBarItemStyle: { paddingTop: 3, paddingBottom: 8 },
      }}>
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Inicio',
          tabBarIcon: (props) => <PosIconTab icon={HomeIcon} {...props} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pedidos',
          tabBarIcon: (props) => <PosIconTab icon={InboxIcon} {...props} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
          tabBarIcon: (props) => <PosIconTab icon={ShoppingCartIcon} {...props} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Productos',
          tabBarIcon: (props) => <PosIconTab icon={TagIcon} {...props} />,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
