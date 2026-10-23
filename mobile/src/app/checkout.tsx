import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorBanner from '../components/ErrorBanner';
import { ProductArt } from '../components/ProductTile';
import SummaryRows from '../components/SummaryRows';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import { money } from '../lib/format';
import { colors, shadow, ui } from '../lib/theme';
import type { CheckoutForm } from '../lib/types';

type Field = keyof CheckoutForm;

const PAYMENT_OPTIONS: { value: 'cod' | 'card'; label: string; hint: string; icon: ComponentProps<typeof Ionicons>['name'] }[] = [
  { value: 'cod', label: 'Cash', hint: 'Pay the driver', icon: 'cash-outline' },
  { value: 'card', label: 'Card', hint: 'Tap at the door', icon: 'card-outline' },
];

function SectionTitle({ icon, title }: { icon: ComponentProps<typeof Ionicons>['name']; title: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Ionicons name={icon} size={18} color={colors.green} />
      <Text style={[ui.h2, { marginBottom: 0 }]}>{title}</Text>
    </View>
  );
}

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { cart, refresh } = useCart();
  const [form, setForm] = useState<CheckoutForm>({
    fullName: user?.name ?? '',
    address: '',
    city: '',
    zip: '',
    phone: user?.phone ?? '',
    paymentMethod: 'cod',
  });
  const [errors, setErrors] = useState<Partial<Record<Field | 'form', string>>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!cart) return null;

  const validate = () => {
    const errs: Partial<Record<Field, string>> = {};
    if (form.fullName.trim().length < 2) errs.fullName = 'Full name is required';
    if (form.address.trim().length < 5) errs.address = 'Street address is required';
    if (form.city.trim().length < 2) errs.city = 'City is required';
    if (!/^\d{5}$/.test(form.zip.trim())) errs.zip = 'ZIP code must be 5 digits';
    if (!/^\d{10,15}$/.test(form.phone.trim())) errs.phone = 'Phone must be 10–15 digits';
    return errs;
  };

  const submit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      const order = await api.placeOrder(form);
      await refresh();
      router.push({ pathname: '/order-success', params: { id: String(order.id), total: String(order.summary.total) } });
    } catch (e) {
      const field = e instanceof ApiError && e.field ? (e.field as Field) : 'form';
      setErrors({ [field]: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  const input = (key: Exclude<Field, 'paymentMethod'>, label: string, props: TextInputProps = {}) => (
    <View style={{ marginBottom: 12, flex: 1 }}>
      <Text style={ui.label}>{label}</Text>
      <TextInput
        style={[ui.input, errors[key] && ui.inputError]}
        value={form[key]}
        onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
        placeholderTextColor={colors.muted}
        accessibilityLabel={label}
        {...props}
      />
      {!!errors[key] && <Text style={ui.fieldError}>{errors[key]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={ui.screen} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View style={ui.card}>
          <SectionTitle icon="basket-outline" title="Order summary" />
          {cart.items.map((i) => (
            <View key={i.productId} style={styles.line}>
              <View style={styles.thumb}>
                <ProductArt product={i.product} size={20} height={40} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.ink, fontWeight: '600' }} numberOfLines={1}>
                  {i.product.name}
                </Text>
                <Text style={[ui.muted, { fontSize: 12 }]}>Qty {i.qty}</Text>
              </View>
              <Text style={{ color: colors.ink, fontWeight: '700' }}>{money(i.lineTotal)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <SummaryRows summary={cart.summary} coupon={cart.coupon?.code} />
        </View>

        <View style={ui.card}>
          <SectionTitle icon="location-outline" title="Delivery details" />
          {!!errors.form && <ErrorBanner message={errors.form} />}
          {input('fullName', 'Full name', { autoComplete: 'name' })}
          {input('address', 'Street address', { autoComplete: 'street-address', placeholder: 'House number and street' })}
          <View style={[ui.row, { gap: 10, alignItems: 'flex-start' }]}>
            {input('city', 'City', { autoComplete: 'postal-address-locality' })}
            {input('zip', 'ZIP code', { keyboardType: 'number-pad', maxLength: 5 })}
          </View>
          {input('phone', 'Phone number', { keyboardType: 'phone-pad', placeholder: 'Our driver will call on arrival' })}
        </View>

        <View style={ui.card}>
          <SectionTitle icon="wallet-outline" title="Payment method" />
          <View style={[ui.row, { gap: 10 }]}>
            {PAYMENT_OPTIONS.map((m) => {
              const active = form.paymentMethod === m.value;
              return (
                <Pressable
                  key={m.value}
                  onPress={() => setForm((f) => ({ ...f, paymentMethod: m.value }))}
                  style={[styles.pay, active && styles.payActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${m.label} on delivery`}
                >
                  <View style={styles.payHead}>
                    <Ionicons name={m.icon} size={22} color={active ? colors.green : colors.ink2} />
                    <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={18} color={active ? colors.green : colors.lineStrong} />
                  </View>
                  <Text style={styles.payLabel}>{m.label} on delivery</Text>
                  <Text style={[ui.muted, { fontSize: 12 }]}>{m.hint}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, shadow]}>
        <Pressable style={[ui.btn, submitting && ui.btnDisabled]} onPress={submit} disabled={submitting} accessibilityRole="button">
          {submitting ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={ui.btnText}>Placing order…</Text>
            </>
          ) : (
            <Text style={ui.btnText}>Place order · {money(cart.summary.total)}</Text>
          )}
        </Pressable>
        <View style={[ui.row, { justifyContent: 'center', gap: 5, marginTop: 8 }]}>
          <Ionicons name="shield-checkmark-outline" size={13} color={colors.muted} />
          <Text style={[ui.muted, { fontSize: 12 }]}>You'll pay when your groceries arrive</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  thumb: { width: 40, height: 40, borderRadius: 10, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginVertical: 8 },
  pay: { flex: 1, borderWidth: 1.5, borderColor: colors.lineStrong, borderRadius: 14, padding: 12, backgroundColor: '#fff', gap: 2 },
  payActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  payHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  payLabel: { fontWeight: '700', color: colors.ink },
  footer: { padding: 16, paddingBottom: 8, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
});
