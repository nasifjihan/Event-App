import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { sendTestNotification } from '@/services/notifications';
import { useTheme, ThemeMode } from '@/theme/ThemeContext';

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const [isSending, setIsSending] = useState(false);

  const handleTestNotification = async () => {
    setIsSending(true);
    try {
      await sendTestNotification();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      Alert.alert('Could not send notification', message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
      <View style={[styles.segmented, { backgroundColor: colors.border }]}>
        {THEME_OPTIONS.map((option) => {
          const isActive = mode === option.value;
          return (
            <Pressable
              key={option.value}
              style={[styles.segment, isActive && { backgroundColor: colors.card }]}
              onPress={() => setMode(option.value)}
            >
              <Text style={[styles.segmentText, { color: isActive ? colors.text : colors.subtext }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.description, { color: colors.subtext }]}>
        "System" follows your device's setting automatically. Your choice is
        saved and will still be set the next time you open the app.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 32 }]}>Notifications</Text>
      <Text style={[styles.description, { color: colors.subtext }]}>
        When you join an event, you'll get a reminder 1 hour before it starts.
        Leaving an event cancels that reminder automatically.
      </Text>
      <Pressable
        style={[styles.button, { backgroundColor: colors.primary }, isSending && styles.buttonDisabled]}
        onPress={handleTestNotification}
        disabled={isSending}
      >
        <Text style={[styles.buttonText, { color: colors.primaryText }]}>
          {isSending ? 'Sending...' : '🔔 Send Test Notification'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  segmented: { flexDirection: 'row', borderRadius: 10, padding: 3, marginBottom: 12 },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  segmentText: { fontSize: 14, fontWeight: '500' },
  description: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontWeight: '600', fontSize: 15 },
});
