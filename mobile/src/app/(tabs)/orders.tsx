import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../../components/EmptyState';
import ErrorBanner from '../../components/ErrorBanner';
import StatusPill from '../../components/StatusPill';
import { api } from '../../lib/api';
import { formatDate, money } from '../../lib/format';
import { colors, ui } from '../../lib/theme';
import type { Order } from '../../lib/types';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .orders()
      .then((list) => setOrders([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <View style={[ui.screen, { padding: 16 }]}>
        <ErrorBanner message={error} />
      </View>
    );
  }
  if (!orders) return <ActivityIndicator style={{ marginTop: 60 }} color={colors.green} />;

  return (
    <FlatList
      style={ui.screen}
      data={orders}
      keyExtractor={(o) => String(o.id)}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      ListEmptyComponent={
        <EmptyState emoji="📦" title="No orders yet" message="When you place an order, it will show up here.">
          <Pressable style={[ui.btn, { paddingHorizontal: 28 }]} onPress={() => router.navigate('/')}>
            <Text style={ui.btnText}>Start shopping</Text>
          </Pressable>
        </EmptyState>
      }
      renderItem={({ item }) => {
        const units = item.items.reduce((n, i) => n + i.qty, 0);
        return (
          <Pressable
            style={({ pressed }) => [ui.card, styles.row, pressed && { opacity: 0.85 }]}
            onPress={() => router.push(`/order/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Order ${item.id}, ${item.status}, ${money(item.summary.total)}`}
          >
            <View style={styles.icon}>
              <Ionicons name="bag-handle-outline" size={22} color={colors.green} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.title}>Order #{item.id}</Text>
              <Text style={[ui.muted, { fontSize: 13 }]}>
                {formatDate(item.createdAt)} · {units} items
              </Text>
              <View style={{ marginTop: 6 }}>
                <StatusPill status={item.status} />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={styles.total}>{money(item.summary.total)}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', fontSize: 16, color: colors.ink },
  total: { fontWeight: '800', fontSize: 16, color: colors.ink },
});
