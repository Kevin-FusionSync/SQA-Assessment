import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import EmptyState from '../../components/EmptyState';
import ErrorBanner from '../../components/ErrorBanner';
import ProductTile from '../../components/ProductTile';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useCart } from '../../lib/cart';
import { categoryEmoji } from '../../lib/format';
import { colors, ui } from '../../lib/theme';
import type { Category, Product } from '../../lib/types';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'rating', label: 'Top rated' },
];

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function ShopScreen() {
  const { user } = useAuth();
  const { count } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Light status bar over the dark header while this tab is focused.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api.products({ search, category, sort, page: 1 });
      setProducts(res.items);
      setPage(1);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const res = await api.products({ search, category, sort, page: page + 1 });
      setProducts((prev) => [...prev, ...res.items]);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  };

  const categoryName = categories.find((c) => c.id === category)?.name;
  const heading = search ? `Results for “${search}”` : categoryName ?? 'All products';
  const firstName = user?.name.split(' ')[0] ?? 'there';

  const header = (
    <View>
      <View style={[styles.top, { paddingTop: 12 }]}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting()}, {firstName} 👋</Text>
            <View style={[ui.row, { gap: 4, marginTop: 2 }]}>
              <Ionicons name="time-outline" size={14} color={colors.lime} />
              <Text style={styles.eta}>Delivery in about 60 minutes</Text>
            </View>
          </View>
          <Pressable style={styles.cartBtn} onPress={() => router.navigate('/cart')} accessibilityRole="button" accessibilityLabel={`Cart, ${count} items`}>
            <Ionicons name="basket-outline" size={22} color="#fff" />
            {count > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{count}</Text>
              </View>
            )}
          </Pressable>
        </View>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search fruits, dairy, snacks…"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => setSearch(query.trim())}
            returnKeyType="search"
            autoCapitalize="none"
            clearButtonMode="while-editing"
            accessibilityLabel="Search products"
          />
        </View>
      </View>

      {!search && !category && (
        <View style={styles.promo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoEyebrow}>THIS WEEK</Text>
            <Text style={styles.promoTitle}>10% off orders of $50+</Text>
            <View style={styles.promoCode}>
              <Ionicons name="pricetag-outline" size={13} color={colors.greenDarker} />
              <Text style={styles.promoCodeText}>SAVE10</Text>
            </View>
          </View>
          <Text style={styles.promoEmoji}>🥑</Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {[{ id: '', name: 'All' }, ...categories].map((c) => {
          const active = category === c.id;
          return (
            <Pressable
              key={c.id || 'all'}
              onPress={() => setCategory(c.id)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={styles.chipEmoji}>{c.id ? categoryEmoji[c.id] ?? '🛒' : '🛒'}</Text>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sectionRow}>
        <View style={{ flex: 1 }}>
          <Text style={ui.sectionTitle} numberOfLines={1}>{heading}</Text>
          {!loading && <Text style={[ui.muted, { fontSize: 13 }]}>{total} {total === 1 ? 'product' : 'products'}</Text>}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, { paddingTop: 0 }]}>
        <Ionicons name="swap-vertical" size={16} color={colors.muted} style={{ alignSelf: 'center' }} />
        {SORTS.map((s) => (
          <Pressable
            key={s.value}
            onPress={() => setSort(s.value)}
            style={[styles.sortChip, sort === s.value && styles.sortChipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: sort === s.value }}
          >
            <Text style={[styles.sortText, sort === s.value && { color: colors.greenDark, fontWeight: '700' }]}>{s.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {!!error && (
        <View style={{ marginHorizontal: 16 }}>
          <ErrorBanner message={error} />
        </View>
      )}
    </View>
  );

  return (
    <View style={ui.screen}>
      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        numColumns={2}
        ListHeaderComponent={header}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 28 }}
        renderItem={({ item }) => <ProductTile product={item} />}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} colors={[colors.green]} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={colors.green} />
          ) : (
            <EmptyState emoji="🔍" title="No products found" message="Try a different search or category." />
          )
        }
        ListFooterComponent={
          page < totalPages && products.length > 0 ? (
            <Pressable style={[ui.btn, ui.btnGhost, { marginHorizontal: 16, marginTop: 4 }]} onPress={loadMore} disabled={loadingMore}>
              {loadingMore ? (
                <ActivityIndicator color={colors.green} />
              ) : (
                <>
                  <Text style={[ui.btnText, ui.btnGhostText]}>Load more</Text>
                  <Ionicons name="chevron-down" size={18} color={colors.ink} />
                </>
              )}
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  top: { backgroundColor: colors.greenDarker, paddingHorizontal: 16, paddingBottom: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  greeting: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  eta: { color: '#D8F2DF', fontSize: 13, fontWeight: '500' },
  cartBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, borderWidth: 2, borderColor: colors.greenDarker },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14 },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 16, color: colors.ink },
  promo: { flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 4, padding: 18, borderRadius: 20, backgroundColor: colors.green, overflow: 'hidden' },
  promoEyebrow: { color: colors.lime, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  promoTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 4, marginBottom: 10 },
  promoCode: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: colors.lime, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  promoCodeText: { color: colors.greenDarker, fontWeight: '800', letterSpacing: 1, fontSize: 12 },
  promoEmoji: { fontSize: 64, marginLeft: 8 },
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipEmoji: { fontSize: 15 },
  chipText: { color: colors.ink2, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
  sortChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  sortChipActive: { backgroundColor: colors.greenSoft },
  sortText: { color: colors.muted, fontSize: 14, fontWeight: '500' },
});
