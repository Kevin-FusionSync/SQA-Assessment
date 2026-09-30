import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ErrorBanner from '../../components/ErrorBanner';
import StatusPill from '../../components/StatusPill';
import SummaryRows from '../../components/SummaryRows';
import { api } from '../../lib/api';
import { formatDate, money, paymentLabel, statusLabel } from '../../lib/format';
import { colors, ui } from '../../lib/theme';
import type { Order, OrderStatus } from '../../lib/types';

const STEPS: OrderStatus[] = ['placed', 'shipped', 'delivered'];

function Timeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <View style={[ui.row, { gap: 8 }]}>
        <Ionicons name="close-circle" size={20} color="#4F5A54" />
        <Text style={{ color: '#4F5A54', fontWeight: '600', flex: 1 }}>This order was cancelled. Items were returned to stock.</Text>
      </View>
    );
  }
  const current = STEPS.indexOf(status);
  return (
    <View style={styles.timeline}>
      {STEPS.map((s, i) => {
        const done = i <= current;
        return (
          <View key={s} style={styles.step}>
            {i > 0 && <View style={[styles.connector, i <= current && { backgroundColor: colors.green }]} />}
            <View style={[styles.dot, done && styles.dotDone]}>
              {done ? <Ionicons name="checkmark" size={14} color="#fff" /> : <Text style={styles.dotText}>{i + 1}</Text>}
            </View>
            <Text style={[styles.stepLabel, done && { color: colors.ink }]}>{statusLabel[s]}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.order(id).then(setOrder).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <View style={[ui.screen, { padding: 16 }]}>
        <ErrorBanner message={error} />
      </View>
    );
  }
  if (!order) return <ActivityIndicator style={{ marginTop: 60 }} color={colors.green} />;

  const cancel = () => {
    Alert.alert('Cancel order?', `Order #${order.id} will be cancelled. This cannot be undone.`, [
      { text: 'Keep order', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            setOrder(await api.cancelOrder(order.id));
          } catch (e) {
            Alert.alert('Could not cancel', (e as Error).message);
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={ui.screen} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
      <View style={ui.card}>
        <View style={[ui.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
          <Text style={[ui.h1, { fontSize: 22 }]}>Order #{order.id}</Text>
          <StatusPill status={order.status} />
        </View>
        <Text style={[ui.muted, { marginBottom: 16 }]}>
          Placed {formatDate(order.createdAt)} · {paymentLabel(order.paymentMethod)}
        </Text>
        <Timeline status={order.status} />
      </View>

      <View style={ui.card}>
        <View style={styles.cardHead}>
          <Ionicons name="receipt-outline" size={18} color={colors.green} />
          <Text style={[ui.h2, { marginBottom: 0 }]}>Items</Text>
        </View>
        {order.items.map((i) => (
          <View key={i.productId} style={styles.line}>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyBadgeText}>{i.qty}×</Text>
            </View>
            <Text style={{ flex: 1, color: colors.ink, fontWeight: '600' }}>{i.name}</Text>
            <Text style={{ color: colors.ink, fontWeight: '700' }}>{money(i.price * i.qty)}</Text>
          </View>
        ))}
      </View>

      <View style={ui.card}>
        <View style={styles.cardHead}>
          <Ionicons name="location-outline" size={18} color={colors.green} />
          <Text style={[ui.h2, { marginBottom: 0 }]}>Delivery address</Text>
        </View>
        <Text style={[styles.address, { color: colors.ink, fontWeight: '700' }]}>{order.shipping.fullName}</Text>
        <Text style={styles.address}>{order.shipping.address}</Text>
        <Text style={styles.address}>
          {order.shipping.city} {order.shipping.zip}
        </Text>
        <Text style={styles.address}>{order.shipping.phone}</Text>
      </View>

      <View style={ui.card}>
        <View style={styles.cardHead}>
          <Ionicons name={order.paymentMethod === 'cod' ? 'cash-outline' : 'card-outline'} size={18} color={colors.green} />
          <Text style={[ui.h2, { marginBottom: 0 }]}>Payment summary</Text>
        </View>
        <SummaryRows summary={order.summary} coupon={order.coupon} />
      </View>

      {order.canCancel && (
        <Pressable style={[ui.btn, ui.btnGhost, { borderColor: colors.red }, cancelling && ui.btnDisabled]} onPress={cancel} disabled={cancelling}>
          <Ionicons name="close-circle-outline" size={18} color={colors.red} />
          <Text style={[ui.btnText, { color: colors.red }]}>{cancelling ? 'Cancelling…' : 'Cancel order'}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  qtyBadge: { minWidth: 34, paddingVertical: 3, borderRadius: 8, backgroundColor: colors.greenSoft, alignItems: 'center' },
  qtyBadgeText: { color: colors.greenDark, fontWeight: '800', fontSize: 12 },
  address: { color: colors.muted, lineHeight: 21 },
  timeline: { flexDirection: 'row' },
  step: { flex: 1, alignItems: 'center', gap: 6 },
  connector: { position: 'absolute', top: 14, right: '50%', width: '100%', height: 3, backgroundColor: colors.line },
  dot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: colors.lineStrong, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: colors.green, borderColor: colors.green },
  dotText: { color: colors.muted, fontWeight: '700', fontSize: 12 },
  stepLabel: { fontSize: 12, fontWeight: '700', color: colors.muted },
});
