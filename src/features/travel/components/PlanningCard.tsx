import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { TravelTripPlan } from '@/types/travel';

interface Props {
  item: TravelTripPlan;
}

const STATUS_LABELS: Record<TravelTripPlan['status'], string> = {
  booked: 'Booked',
  draft: 'Draft',
  saved: 'Saved',
};

export default function PlanningCard({ item }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <Text style={[styles.windowLabel, { color: colors.subtext }]}>{item.windowLabel}</Text>
        <View style={[styles.statusPill, { backgroundColor: colors.background }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>{item.subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  windowLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
