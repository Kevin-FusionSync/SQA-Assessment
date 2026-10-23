import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../lib/api';
import { useCart } from '../lib/cart';
import { money } from '../lib/format';
import { colors } from '../lib/theme';
import type { Product } from '../lib/types';

export function ProductArt({ product, size = 64, height }: { product: Product; size?: number; height?: number }) {
  return (
    <View style={[styles.art, { backgroundColor: product.color }, height ? { height } : null]}>
      <View style={[styles.glow, { width: size * 1.9, height: size * 1.9, borderRadius: size }]} />
      <Text style={{ fontSize: size }}>{product.emoji}</Text>
    </View>
  );
}

export const discountPercent = (p: Product) =>
  p.originalPrice && p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

export default function ProductTile({ product }: { product: Product }) {
  const { setCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const off = discountPercent(product);

  const quickAdd = async () => {
    setAdding(true);
    try {
      setCart(await api.addToCart(product.id, 1));
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } catch (e) {
      Alert.alert('Could not add to cart', (e as Error).message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.wrap}>
    <Pressable
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
      onPress={() => router.push(`/product/${product.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${money(product.price)}`}
    >
      <View>
        <ProductArt product={product} size={46} />
        <View style={styles.tags}>
          {product.originalPrice ? <Text style={[styles.tag, styles.sale]}>{off ? `−${off}%` : 'Sale'}</Text> : null}
          {product.inStock && product.stock <= 5 ? <Text style={[styles.tag, styles.low]}>Only {product.stock} left</Text> : null}
        </View>
        {!product.inStock ? (
          <View style={styles.oosOverlay}>
            <Text style={[styles.tag, styles.oos]}>Out of stock</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.unit}>{product.unit}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={11} color={colors.star} />
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.priceRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.price}>{money(product.price)}</Text>
            {product.originalPrice ? <Text style={styles.old}>{money(product.originalPrice)}</Text> : null}
          </View>
          <View style={styles.addSpace} />
        </View>
      </View>
    </Pressable>
          <Pressable
            style={[styles.addBtn, styles.addBtnPos, added && { backgroundColor: colors.greenDark }, !product.inStock && styles.addBtnDisabled]}
            onPress={quickAdd}
            disabled={!product.inStock || adding}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={product.inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
            accessibilityState={{ disabled: !product.inStock || adding }}
          >
            {adding ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name={added ? 'checkmark' : 'add'} size={22} color="#fff" />
            )}
          </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  tile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  art: { height: 118, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  glow: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.55)' },
  tags: { position: 'absolute', top: 8, left: 8, gap: 4, alignItems: 'flex-start' },
  tag: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    overflow: 'hidden',
  },
  sale: { backgroundColor: colors.red, color: '#fff' },
  low: { backgroundColor: '#fff', color: colors.amber },
  oosOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.45)', alignItems: 'center', justifyContent: 'center' },
  oos: { backgroundColor: 'rgba(16,35,26,0.88)', color: '#fff' },
  body: { padding: 12, paddingTop: 10 },
  name: { fontWeight: '700', color: colors.ink, fontSize: 14.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  unit: { color: colors.muted, fontSize: 12 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 12, fontWeight: '700', color: colors.ink2 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 8, gap: 6 },
  price: { fontWeight: '800', fontSize: 16, color: colors.ink },
  old: { color: colors.muted, fontSize: 12, textDecorationLine: 'line-through' },
  addBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  addBtnPos: { position: 'absolute', right: 12, bottom: 12 },
  addSpace: { width: 36, height: 36 },
  addBtnDisabled: { backgroundColor: colors.lineStrong },
});
