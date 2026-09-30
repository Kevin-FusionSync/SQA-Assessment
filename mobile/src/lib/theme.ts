import { Platform, StyleSheet } from 'react-native';

export const colors = {
  green: '#15803D',
  greenDark: '#166534',
  greenDarker: '#0F4D2A',
  greenSoft: '#EAF7EE',
  greenTint: '#D3F0DC',
  lime: '#B9F18C',
  ink: '#10231A',
  ink2: '#34463C',
  muted: '#5B6B62',
  line: '#E2E9E4',
  lineStrong: '#CFDAD3',
  bg: '#F5F7F4',
  card: '#FFFFFF',
  red: '#C62828',
  redSoft: '#FDECEC',
  amber: '#A15C07',
  amberSoft: '#FDF3E1',
  star: '#E5A00D',
};

export const statusColors: Record<string, { bg: string; fg: string }> = {
  placed: { bg: '#E8EFFF', fg: '#1D4ED8' },
  shipped: { bg: colors.amberSoft, fg: '#7A4A05' },
  delivered: { bg: colors.greenSoft, fg: colors.greenDark },
  cancelled: { bg: '#EEF0EF', fg: '#4F5A54' },
};

export const shadow = Platform.select({
  ios: { shadowColor: '#10231A', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  android: { elevation: 2 },
  default: {},
});

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 16 },
  h1: { fontSize: 26, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  h2: { fontSize: 17, fontWeight: '700', color: colors.ink, marginBottom: 10 },
  muted: { color: colors.muted },
  input: {
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    backgroundColor: '#fff',
    color: colors.ink,
  },
  inputError: { borderColor: colors.red },
  label: { fontWeight: '700', fontSize: 13, color: colors.ink2, marginBottom: 6 },
  fieldError: { color: colors.red, fontSize: 13, fontWeight: '600', marginTop: 5 },
  btn: {
    backgroundColor: colors.green,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.lineStrong },
  btnGhostText: { color: colors.ink },
  btnDisabled: { opacity: 0.5 },
  alert: { backgroundColor: colors.redSoft, borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  alertText: { color: '#8E1F1F', flex: 1, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, letterSpacing: -0.3 },
});
