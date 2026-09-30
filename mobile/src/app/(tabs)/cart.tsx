import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import EmptyState from '../../components/EmptyState';
import { ProductArt } from '../../components/ProductTile';
import SummaryRows from '../../components/SummaryRows';
import { api } from '../../lib/api';
import { useCart } from '../../lib/cart';
import { money } from '../../lib/format';
import { colors, shadow, ui } from '../../lib/theme';
import type { Cart, CartItem } from '../../lib/types';

const FREE_DELIVERY_THRESHOLD = 75;

export default function CartScreen() {
  const { cart, setCart, refresh } = useCart();
  const [code, setCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [busy, setBusy] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => undefined);
    }, [refresh]),
  );

  const run = async (productId: number, action: () => Promise<Cart>) => {
    setBusy(productId);
    try {
      setCart(await action());
    } catch (e) {
      Alert.alert('Something went wrong', (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const applyCoupon = async () => {
    setCouponError('');
    if (!code.trim()) return;
    try {
      setCart(await api.applyCoupon(code));
      setCode('');
    } catch (e) {
      setCouponError((e as Error).message);
    }
  };

  if (!cart) return null;

  if (cart.items.length === 0) {
    return (
      <View style={[ui.screen, { justifyContent: 'center' }]}>
        <EmptyState emoji="🧺" title="Your cart is empty" message="Fresh fruit, bakery treats and more are just a tap away.">
          <Pressable style={[ui.btn, { paddingHorizontal: 28 }]} onPress={() => router.navigate('/')}>
            <Ionicons name="storefront-outline" size={18} color="#fff" />
            <Text style={ui.btnText}>Start shopping</Text>
          </Pressable>
        </EmptyState>
      </View>
    );
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const toFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - cart.summary.subtotal);
  const progress = cart.summary.delivery === 0 ? 1 : Math.min(1, Math.max(0, cart.summary.subtotal / FREE_DELIVERY_THRESHOLD));

  const renderItem = ({ item }: { item: CartItem }) => {
    const max = Math.min(10, item.product.stock);
    const isBusy = busy === item.productId;
    return (
      <View style={[ui.card, styles.item, isBusy && { opacity: 0.6 }]}>
        <Pressable style={styles.thumb} onPress={() => router.push(`/product/${item.productId}`)} accessibilityLabel={`View ${item.product.name}`}>
          <ProductArt product={item.product} size={30} height={68} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <View style={[ui.row, { alignItems: 'flex-start', gap: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.product.name}</Text>
              <Text style={[ui.muted, { fontSize: 13 }]}>{item.product.unit} · {money(item.product.price)} each</Text>
            </View>
            <Pressable
              hitSlop={10}
              onPress={() => run(item.productId, () => api.removeCartItem(item.productId))}
              accessibilityLabel={`Remove ${item.product.name}`}
              style={styles.trash}
            >
              <Ionicons name="trash-outline" size={18} color={colors.red} />
            </Pressable>
          </View>
          <View style={[ui.row, { marginTop: 10, justifyContent: 'space-between' }]}>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepBtn}
                disabled={isBusy}
                onPress={() => run(item.productId, () => api.updateCartItem(item.productId, item.qty - 1))}
                accessibilityLabel={`Decrease ${item.product.name}`}
              >
                <Ionicons name="remove" size={13} color={colors.ink} />
              </Pressable>
              <Text style={styles.qty}>{item.qty}</Text>
              <Pressable
                style={[styles.stepBtn, item.qty >= max && { opacity: 0.3 }]}
                disabled={isBusy || item.qty >= max}
                onPress={() => run(item.productId, () => api.updateCartItem(item.productId, item.qty + 1))}
                accessibilityLabel={`Increase ${item.product.name}`}
              >
                <Ionicons name="add" size={13} color={colors.ink} />
              </Pressable>
            </View>
            <Text style={styles.lineTotal}>{money(item.lineTotal)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={ui.screen}>
      <FlatList
        data={cart.items}
        keyExtractor={(i) => String(i.productId)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={[ui.card, styles.delivery]}>
            <Ionicons name="bicycle" size={22} color={colors.green} />
            <View style={{ flex: 1 }}>
              <Text style={styles.deliveryText}>
                {toFreeDelivery > 0 && cart.summary.delivery > 0 ? (
                  <>Add <Text style={{ fontWeight: '800' }}>{money(toFreeDelivery)}</Text> more for free delivery</>
                ) : (
                  <Text style={{ fontWeight: '800' }}>You've unlocked free delivery!</Text>
                )}
              </Text>
              <View style={styles.progress}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={[ui.card, { marginTop: 6 }]}>
            {cart.coupon ? (
              <View style={styles.couponApplied}>
                <Ionicons name="pricetag" size={18} color={colors.green} />
                <Text style={{ flex: 1, color: colors.greenDarker }}>
                  <Text style={{ fontWeight: '800' }}>{cart.coupon.code}</Text> · {cart.coupon.description}
                </Text>
                <Pressable onPress={async () => setCart(await api.removeCoupon())} hitSlop={8}>
                  <Text style={{ color: colors.red, fontWeight: '700' }}>Remove</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={ui.label}>Coupon code</Text>
                <View style={[ui.row, { gap: 8 }]}>
                  <TextInput
                    style={[ui.input, { flex: 1 }, !!couponError && ui.inputError]}
                    value={code}
                    onChangeText={setCode}
                    placeholder="e.g. SAVE10"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={applyCoupon}
                  />
                  <Pressable style={[ui.btn, ui.btnGhost, { paddingHorizontal: 18 }]} onPress={applyCoupon}>
                    <Text style={[ui.btnText, ui.btnGhostText]}>Apply</Text>
                  </Pressable>
                </View>
                {!!couponError && <Text style={ui.fieldError}>{couponError}</Text>}
              </>
            )}
            {!!cart.couponMessage && (
              <View style={styles.warn}>
                <Ionicons name="information-circle" size={18} color={colors.amber} />
                <Text style={{ flex: 1, color: '#72420A' }}>Coupon removed: {cart.couponMessage}</Text>
              </View>
            )}

            <View style={{ marginTop: 14 }}>
              <View style={styles.subRow}>
                <Text style={ui.muted}>Subtotal</Text>
                <Text style={styles.subValue}>${subtotal}</Text>
              </View>
              <SummaryRows summary={cart.summary} coupon={cart.coupon?.code} hideSubtotal />
            </View>
          </View>
        }
      />
      <View style={[styles.footer, shadow]}>
        <View>
          <Text style={[ui.muted, { fontSize: 12 }]}>Total</Text>
          <Text style={styles.footerTotal}>{money(cart.summary.total)}</Text>
        </View>
        <Pressable style={[ui.btn, { flex: 1 }]} onPress={() => router.push('/checkout')}>
          <Text style={ui.btnText}>Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 12 },
  thumb: { width: 68, borderRadius: 14, overflow: 'hidden', height: 68 },
  name: { fontWeight: '700', color: colors.ink, fontSize: 15 },
  trash: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.lineStrong, borderRadius: 12, backgroundColor: colors.bg },
  stepBtn: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 26, textAlign: 'center', fontWeight: '800', color: colors.ink },
  lineTotal: { fontWeight: '800', fontSize: 15, color: colors.ink },
  delivery: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 2 },
  deliveryText: { color: colors.ink, fontSize: 14, marginBottom: 8 },
  progress: { height: 7, borderRadius: 4, backgroundColor: colors.greenSoft, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.green },
  couponApplied: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.greenSoft, padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.green },
  warn: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: colors.amberSoft, padding: 10, borderRadius: 10, marginTop: 10 },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  subValue: { fontWeight: '600', color: colors.ink },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  footerTotal: { fontSize: 20, fontWeight: '800', color: colors.ink },
});
