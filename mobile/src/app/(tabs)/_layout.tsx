import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import type { ComponentProps } from 'react';
import { useCart } from '../../lib/cart';
import { colors } from '../../lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const icon = (active: IconName, inactive: IconName) =>
  function TabIcon({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) {
    return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
  };

export default function TabsLayout() {
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: { borderTopColor: colors.line, backgroundColor: colors.card },
        headerTitleStyle: { fontWeight: '800', fontSize: 18, color: colors.ink },
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Shop', headerShown: false, tabBarIcon: icon('storefront', 'storefront-outline') }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          headerTitle: 'Your cart',
          tabBarIcon: icon('basket', 'basket-outline'),
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.red, fontWeight: '800', fontSize: 11 },
        }}
      />
      <Tabs.Screen name="orders" options={{ title: 'Orders', headerTitle: 'Your orders', tabBarIcon: icon('receipt', 'receipt-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', headerTitle: 'Account', tabBarIcon: icon('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}
