import { StyleSheet, Text, View } from 'react-native';
import { money } from '../lib/format';
import { colors } from '../lib/theme';
import type { Summary } from '../lib/types';

interface Props {
  summary: Summary;
  coupon?: string | null;
  hideSubtotal?: boolean;
}

function Row({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <View style={[styles.row, strong && styles.totalRow]}>
      <Text style={strong ? styles.totalLabel : styles.label}>{label}</Text>
      <Text style={[strong ? styles.totalValue : styles.value, accent && { color: colors.greenDark }]}>{value}</Text>
    </View>
  );
}

export default function SummaryRows({ summary, coupon, hideSubtotal }: Props) {
  return (
    <View>
      {!hideSubtotal && <Row label="Subtotal" value={money(summary.subtotal)} />}
      {summary.discount > 0 && <Row label={`Discount${coupon ? ` (${coupon})` : ''}`} value={`−${money(summary.discount)}`} accent />}
      <Row label="Delivery" value={summary.delivery === 0 ? 'Free' : money(summary.delivery)} />
      <Row label="Tax (8%)" value={money(summary.tax)} />
      <Row label="Total" value={money(summary.total)} strong />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  label: { color: colors.muted },
  value: { fontWeight: '600', color: colors.ink },
  totalRow: { borderTopWidth: 1, borderColor: colors.line, marginTop: 6, paddingTop: 10 },
  totalLabel: { fontWeight: '800', fontSize: 16, color: colors.ink },
  totalValue: { fontWeight: '800', fontSize: 16, color: colors.ink },
});
