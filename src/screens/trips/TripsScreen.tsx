import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PlanningCard from '@/features/travel/components/PlanningCard';
import SectionHeader from '@/features/travel/components/SectionHeader';
import { planningBoardItems } from '@/features/travel/data/travelCollections';
import { useTheme } from '@/theme/ThemeContext';

export default function TripsScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: colors.subtext }]}>Trip Management</Text>
      <Text style={[styles.title, { color: colors.text }]}>A planning board for active trips, drafts, and dream itineraries.</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>
        This is where the app starts feeling like a real travel operating system instead of just a feed.
      </Text>

      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>Professional structure</Text>
        <Text style={[styles.summaryBody, { color: colors.subtext }]}>
          The current implementation introduces a dedicated space for booked trips, in-progress itineraries,
          and saved concepts. The next backend phase will connect this to live bookings and planner items.
        </Text>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Planning board"
          subtitle="Modeled as a single place for travel operations, collaboration, and itinerary checkpoints."
        />
        <View style={styles.list}>
          {planningBoardItems.map((item) => (
            <PlanningCard key={item.id} item={item} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
    maxWidth: 640,
  },
  summaryCard: {
    marginTop: 24,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryBody: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  section: {
    marginTop: 28,
  },
  list: {
    marginTop: 16,
  },
});
