import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, ui } from '../lib/theme';

export default function EmptyState({ emoji, title, message, children }: { emoji: string; title: string; message?: string; children?: ReactNode }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.circle}>
        <Text style={{ fontSize: 42 }}>{emoji}</Text>
      </View>
      <Text style={[ui.h2, { marginBottom: 0, textAlign: 'center' }]}>{title}</Text>
      {message ? <Text style={[ui.muted, { textAlign: 'center' }]}>{message}</Text> : null}
      {children ? <View style={{ marginTop: 12, alignSelf: 'stretch', alignItems: 'center' }}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 6 },
  circle: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
});
