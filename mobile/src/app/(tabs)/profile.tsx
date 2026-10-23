import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatDate } from '../../lib/format';
import { colors, ui } from '../../lib/theme';

function MenuRow({ icon, label, onPress }: { icon: ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: colors.bg }]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={18} color={colors.green} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const save = async () => {
    const errs: typeof errors = {};
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (phone.trim() && !/^\d{10,15}$/.test(phone.trim())) errs.phone = 'Phone must be 10–15 digits';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      setUser(await api.updateMe({ name: name.trim(), phone: phone.trim() }));
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e) {
      if (e instanceof ApiError && (e.field === 'name' || e.field === 'phone')) setErrors({ [e.field]: e.message });
      else Alert.alert('Could not save', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () =>
    Alert.alert('Log out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);

  return (
    <KeyboardAvoidingView style={ui.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View style={[ui.card, styles.head]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[ui.h2, { marginBottom: 2 }]}>{user.name}</Text>
            <Text style={ui.muted}>{user.email}</Text>
            <Text style={[ui.muted, { fontSize: 12, marginTop: 2 }]}>Member since {formatDate(user.createdAt)}</Text>
          </View>
        </View>

        <View style={ui.card}>
          <Text style={ui.h2}>Personal details</Text>
          <Text style={ui.label}>Full name</Text>
          <TextInput style={[ui.input, errors.name && ui.inputError]} value={name} onChangeText={setName} autoComplete="name" accessibilityLabel="Full name" />
          {!!errors.name && <Text style={ui.fieldError}>{errors.name}</Text>}

          <Text style={[ui.label, { marginTop: 14 }]}>Phone (optional)</Text>
          <TextInput
            style={[ui.input, errors.phone && ui.inputError]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            accessibilityLabel="Phone"
            placeholder="10–15 digits"
            placeholderTextColor={colors.muted}
          />
          {!!errors.phone && <Text style={ui.fieldError}>{errors.phone}</Text>}

          <Pressable style={[ui.btn, { marginTop: 18 }, saving && ui.btnDisabled]} onPress={save} disabled={saving} accessibilityRole="button">
            <Text style={ui.btnText}>{saving ? 'Saving…' : 'Save changes'}</Text>
          </Pressable>
        </View>

        <View style={[ui.card, { padding: 0, overflow: 'hidden' }]}>
          <MenuRow icon="receipt-outline" label="Order history" onPress={() => router.navigate('/orders')} />
          <MenuRow icon="basket-outline" label="Your cart" onPress={() => router.navigate('/cart')} />
          <MenuRow
            icon="help-buoy-outline"
            label="Help & support"
            onPress={() => Alert.alert('Customer care', 'Every day, 7am – 11pm\nsupport@freshcart.example\n(555) 010-2026')}
          />
        </View>

        <Pressable style={[ui.btn, ui.btnGhost]} onPress={confirmLogout} accessibilityRole="button" accessibilityLabel="Log out">
          <Ionicons name="log-out-outline" size={18} color={colors.red} />
          <Text style={[ui.btnText, { color: colors.red }]}>Log out</Text>
        </Pressable>
        <Text style={[ui.muted, { textAlign: 'center', fontSize: 12 }]}>FreshCart v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  menuIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.ink },
});
