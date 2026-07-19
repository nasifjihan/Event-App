import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

interface Props {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onPressAction?: () => void;
}

export default function SectionHeader({ title, subtitle, actionLabel, onPressAction }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>{subtitle}</Text>
      </View>
      {actionLabel ? (
        <Pressable onPress={onPressAction} style={[styles.action, { borderColor: colors.border }]}>
          <Text style={[styles.actionText, { color: colors.text }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  action: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  actionText: { fontSize: 13, fontWeight: '600' },
});
