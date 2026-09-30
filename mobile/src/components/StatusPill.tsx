import { StyleSheet, Text, View } from 'react-native';
import { statusLabel } from '../lib/format';
import { statusColors } from '../lib/theme';

export default function StatusPill({ status }: { status: string }) {
  const c = statusColors[status] ?? statusColors.cancelled;
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.fg }]} />
      <Text style={[styles.text, { color: c.fg }]}>{statusLabel[status] ?? status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '700' },
});
