import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../../components/EmptyState';
import { ProductArt } from '../../components/ProductTile';
import { api } from '../../lib/api';
import { useCart } from '../../lib/cart';
import { categoryEmoji, money } from '../../lib/format';
import { colors, shadow, ui } from '../../lib/theme';
import type { Category, Product } from '../../lib/types';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.product(id).then(setProduct).catch((e) => setError(e.message));
    api.categories().then(setCategories).catch(() => setCategories([]));
  }, [id]);

  if (error) {
    return (
      <View style={[ui.screen, { justifyContent: 'center' }]}>
        <EmptyState emoji="🥲" title={error} message="It may have been removed or the link is incorrect." />
      </View>
    );
  }
  if (!product) return <ActivityIndicator style={{ marginTop: 60 }} color={colors.green} />;

  const max = Math.min(10, product.stock);
  const displayPrice = product.originalPrice ?? product.price;
  const categoryName = categories.find((c) => c.id === product.category)?.name ?? product.category;
  const stockColor = !product.inStock ? colors.red : product.stock <= 5 ? colors.amber : colors.green;

  const add = async () => {
    setAdding(true);
    try {
      setCart(await api.addToCart(product.id, qty));
      Alert.alert('Added to cart', `${qty} × ${product.name}`);
      setQty(1);
    } catch (e) {
      Alert.alert('Could not add to cart', (e as Error).message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView style={ui.screen} edges={['bottom']}>
      <Stack.Screen options={{ title: product.name }} />
      <ScrollView>
        <View style={styles.hero}>
          <ProductArt product={product} size={130} height={280} />
        </View>
        <View style={styles.sheet}>
          <View style={styles.categoryPill}>
            <Text style={{ fontSize: 13 }}>{categoryEmoji[product.category] ?? '🛒'}</Text>
            <Text style={styles.categoryText}>{categoryName}</Text>
          </View>
          <Text style={[ui.h1, { marginTop: 10 }]}>{product.name}</Text>
          <View style={[ui.row, { gap: 10, marginTop: 6 }]}>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={13} color={colors.star} />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            </View>
            <Text style={ui.muted}>{product.unit}</Text>
          </View>

          <View style={[ui.row, { marginTop: 18, gap: 10 }]}>
            <Text style={styles.price}>{money(displayPrice)}</Text>
            {product.originalPrice ? <Text style={styles.sale}>On sale</Text> : null}
          </View>
          <View style={[ui.row, { gap: 8, marginTop: 10 }]}>
            <View style={[styles.stockDot, { backgroundColor: stockColor }]} />
            <Text style={[styles.stock, { color: stockColor }]}>
              {!product.inStock ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>About this item</Text>
          <Text style={styles.desc}>{product.description}</Text>

          <View style={styles.perks}>
            {[
              { icon: 'time-outline' as const, text: 'Delivered in about 60 minutes' },
              { icon: 'leaf-outline' as const, text: 'Freshness guaranteed or your money back' },
              { icon: 'bicycle-outline' as const, text: 'Free delivery on orders over $75' },
            ].map((p) => (
              <View key={p.text} style={styles.perk}>
                <View style={styles.perkIcon}>
                  <Ionicons name={p.icon} size={16} color={colors.green} />
                </View>
                <Text style={{ flex: 1, color: colors.ink2 }}>{p.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, shadow]}>
        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} accessibilityLabel="Decrease quantity">
            <Ionicons name="remove" size={20} color={qty <= 1 ? colors.lineStrong : colors.ink} />
          </Pressable>
          <Text style={styles.qty}>{qty}</Text>
          <Pressable style={styles.stepBtn} onPress={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} accessibilityLabel="Increase quantity">
            <Ionicons name="add" size={20} color={qty >= max ? colors.lineStrong : colors.ink} />
          </Pressable>
        </View>
        <Pressable
          style={[ui.btn, { flex: 1 }, (!product.inStock || adding) && ui.btnDisabled]}
          onPress={add}
          disabled={!product.inStock || adding}
          accessibilityRole="button"
          accessibilityLabel={product.inStock ? 'Add to cart' : 'Out of stock'}
          accessibilityState={{ disabled: !product.inStock || adding }}
        >
          {adding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              {product.inStock && <Ionicons name="basket-outline" size={18} color="#fff" />}
              <Text style={ui.btnText}>{product.inStock ? 'Add to cart' : 'Out of stock'}</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.card },
  sheet: { backgroundColor: colors.bg, marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingTop: 22 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: colors.greenSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  categoryText: { color: colors.greenDark, fontWeight: '700', fontSize: 12 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  ratingText: { fontWeight: '700', color: colors.ink2, fontSize: 13 },
  price: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  sale: { backgroundColor: colors.red, color: '#fff', fontWeight: '800', fontSize: 12, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stock: { fontWeight: '700' },
  sectionLabel: { marginTop: 22, marginBottom: 6, fontSize: 15, fontWeight: '800', color: colors.ink },
  desc: { fontSize: 15, lineHeight: 23, color: colors.ink2 },
  perks: { marginTop: 18, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 12 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perkIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.lineStrong, borderRadius: 14, backgroundColor: colors.bg },
  stepBtn: { width: 44, height: 50, alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 28, textAlign: 'center', fontSize: 17, fontWeight: '800', color: colors.ink },
});
