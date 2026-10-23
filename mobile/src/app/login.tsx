import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorBanner from '../components/ErrorBanner';
import { useAuth } from '../lib/auth';
import { colors, shadow, ui } from '../lib/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const submit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password');
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <View style={[ui.screen, { backgroundColor: colors.greenDarker }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
            <View style={styles.hero}>
              <View style={styles.emojiRow}>
                {['🥬', '🍊', '🧀', '🥐'].map((e, i) => (
                  <View key={e} style={[styles.emojiTile, i % 2 === 1 && { marginTop: 14 }]}>
                    <Text style={{ fontSize: 26 }}>{e}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.brand}>
                Fresh<Text style={{ color: colors.lime }}>Cart</Text>
              </Text>
              <Text style={styles.tagline}>Groceries at your door in about 60 minutes.</Text>
            </View>

            <View style={[styles.sheet, shadow]}>
              <Text style={ui.h1}>Welcome back</Text>
              <Text style={[ui.muted, styles.subtitle]}>Sign in to continue shopping.</Text>

              {!!error && <ErrorBanner message={error} />}

              <Text style={ui.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={colors.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                  accessibilityLabel="Email"
                />
              </View>

              <Text style={[ui.label, { marginTop: 14 }]}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="Your password"
                  placeholderTextColor={colors.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  returnKeyType="go"
                  onSubmitEditing={submit}
                  accessibilityLabel="Password"
                />
              </View>

              <Pressable style={[ui.btn, { marginTop: 24 }, submitting && ui.btnDisabled]} onPress={submit} disabled={submitting} accessibilityRole="button">
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={ui.btnText}>Sign in</Text>}
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={[ui.muted, { fontSize: 13 }]}>New to FreshCart?</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable style={[ui.btn, ui.btnGhost]} onPress={() => router.push('/register')} accessibilityRole="button">
                <Text style={[ui.btnText, ui.btnGhostText]}>Create an account</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 28, paddingBottom: 44, paddingHorizontal: 24 },
  emojiRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  emojiTile: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  brand: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  tagline: { color: '#D8F2DF', marginTop: 6, fontSize: 15, textAlign: 'center' },
  sheet: { flexGrow: 1, backgroundColor: colors.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingTop: 30, paddingBottom: 40 },
  subtitle: { marginTop: 4, marginBottom: 22 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.lineStrong, borderRadius: 14, backgroundColor: '#fff', paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 13, fontSize: 16, color: colors.ink },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.lineStrong },
});
