import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { money } from '../lib/format';
import { colors, ui } from '../lib/theme';

export default function OrderSuccessScreen() {
  const { id, total } = useLocalSearchParams<{ id: string; total: string }>();

  return (
    <View style={[ui.screen, styles.container]}>
      <View style={styles.ring}>
        <View style={styles.circle}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>
      </View>
      <Text style={[ui.h1, { textAlign: 'center' }]}>Thank you for your order!</Text>
      <Text style={[ui.muted, { textAlign: 'center', marginTop: 8, fontSize: 15 }]}>We've received your order and are picking your groceries now.</Text>

      <View style={[ui.card, styles.info]}>
        <View style={styles.infoRow}>
          <Text style={ui.muted}>Order number</Text>
          <Text style={styles.infoValue}>#{id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={ui.muted}>Total</Text>
          <Text style={styles.infoValue}>{money(Number(total))}</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={ui.muted}>Estimated arrival</Text>
          <View style={[ui.row, { gap: 4 }]}>
            <Ionicons name="time-outline" size={15} color={colors.green} />
            <Text style={styles.infoValue}>About 60 minutes</Text>
          </View>
        </View>
      </View>

      <View style={{ width: '100%', gap: 10, marginTop: 24 }}>
        <Pressable style={ui.btn} onPress={() => router.push(`/order/${id}`)}>
          <Ionicons name="navigate-outline" size={18} color="#fff" />
          <Text style={ui.btnText}>Track order</Text>
        </Pressable>
        <Pressable
          style={[ui.btn, ui.btnGhost]}
          onPress={() => {
            router.dismissAll();
            router.navigate('/');
          }}
        >
          <Text style={[ui.btnText, ui.btnGhostText]}>Continue shopping</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  ring: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  circle: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  info: { width: '100%', marginTop: 24, paddingVertical: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  infoValue: { fontWeight: '800', color: colors.ink },
});
