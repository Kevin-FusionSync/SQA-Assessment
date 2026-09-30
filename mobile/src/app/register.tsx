import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ErrorBanner from '../components/ErrorBanner';
import { ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { colors, ui } from '../lib/theme';

type Field = 'name' | 'email' | 'password' | 'form';

function FieldBox({ icon, error, children }: { icon: ComponentProps<typeof Ionicons>['name']; error?: boolean; children: ReactNode }) {
  return (
    <View style={[styles.inputWrap, error && ui.inputError]}>
      <Ionicons name={icon} size={18} color={colors.muted} />
      {children}
    </View>
  );
}

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const errs: Partial<Record<Field, string>> = {};
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email.trim()) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (e) {
      const field = e instanceof ApiError && e.field ? (e.field as Field) : 'form';
      setErrors({ [field]: (e as Error).message });
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={ui.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={14} color={colors.greenDark} />
          <Text style={styles.badgeText}>Free delivery on orders over $75</Text>
        </View>
        <Text style={ui.h1}>Join FreshCart</Text>
        <Text style={[ui.muted, { marginTop: 4, marginBottom: 22 }]}>Fresh groceries in under an hour.</Text>

        {!!errors.form && <ErrorBanner message={errors.form} />}

        <Text style={ui.label}>Full name</Text>
        <FieldBox icon="person-outline" error={!!errors.name}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Jane Doe"
            placeholderTextColor={colors.muted}
            autoComplete="name"
          />
        </FieldBox>
        {!!errors.name && <Text style={ui.fieldError}>{errors.name}</Text>}

        <Text style={[ui.label, { marginTop: 14 }]}>Email</Text>
        <FieldBox icon="mail-outline" error={!!errors.email}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </FieldBox>
        {!!errors.email && <Text style={ui.fieldError}>{errors.email}</Text>}

        <Text style={[ui.label, { marginTop: 14 }]}>Password</Text>
        <FieldBox icon="lock-closed-outline" error={!!errors.password}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters, including a number"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoComplete="new-password"
          />
        </FieldBox>
        {!!errors.password && <Text style={ui.fieldError}>{errors.password}</Text>}

        <Pressable style={[ui.btn, { marginTop: 26 }, submitting && ui.btnDisabled]} onPress={submit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={ui.btnText}>Create account</Text>}
        </Pressable>
        <Text style={[ui.muted, { textAlign: 'center', fontSize: 12, marginTop: 14 }]}>
          By creating an account you agree to our terms of service.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.greenSoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, marginBottom: 14 },
  badgeText: { color: colors.greenDark, fontWeight: '700', fontSize: 12 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.lineStrong, borderRadius: 14, backgroundColor: '#fff', paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 13, fontSize: 16, color: colors.ink },
});
