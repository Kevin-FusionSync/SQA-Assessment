import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';
import { colors, ui } from '../lib/theme';

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={ui.alert} accessibilityRole="alert">
      <Ionicons name="alert-circle" size={18} color={colors.red} />
      <Text style={ui.alertText}>{message}</Text>
    </View>
  );
}
