import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SectionHeader from '@/features/travel/components/SectionHeader';
import { destinationSpotlights } from '@/features/travel/data/travelCollections';
import { useTheme } from '@/theme/ThemeContext';

export default function SavedScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: colors.subtext }]}>Wishlists And Research</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        Save destinations, compare ideas, and keep your travel decisions in one curated place.
      </Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>
        Professional travel apps need a memory layer for inspiration, not just a booking feed.
      </Text>

      <View style={styles.section}>
        <SectionHeader
          title="Saved spotlights"
          subtitle="Pinned inspiration that can later convert into itineraries or direct bookings."
        />
        <View style={styles.grid}>
          {destinationSpotlights.map((destination) => (
            <View
              key={destination.id}
              style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.tileCountry, { color: colors.subtext }]}>{destination.country}</Text>
              <Text style={[styles.tileTitle, { color: colors.text }]}>{destination.title}</Text>
              <Text style={[styles.tileBody, { color: colors.subtext }]}>{destination.tagline}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.notesTitle, { color: colors.text }]}>Next professional upgrade</Text>
        <Text style={[styles.notesBody, { color: colors.subtext }]}>
          Connect this screen to real favorites, comparison tables, saved filters, and team-shared boards so users can
          move naturally from inspiration to itinerary and booking.
        </Text>
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
  section: {
    marginTop: 28,
  },
  grid: {
    marginTop: 16,
    gap: 14,
  },
  tile: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  tileCountry: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tileTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  tileBody: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  notesCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginTop: 28,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  notesBody: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
});
