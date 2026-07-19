import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SectionHeader from '@/features/travel/components/SectionHeader';
import { useTheme } from '@/theme/ThemeContext';
import { useFavoriteExperiences } from '@/hooks/useFavoriteExperiences';
import { TravelStackParamList } from '@/navigation/TravelStackNavigator';

export default function SavedScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<TravelStackParamList>>();
  const { favorites, isLoading, isError, error, refetch } = useFavoriteExperiences();

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
          title="Saved experiences"
          subtitle="Favorites now read from the travel data layer and stay ready for itinerary planning."
          actionLabel="Refresh"
          onPressAction={() => refetch()}
        />
        <View style={styles.grid}>
          {isLoading ? <ActivityIndicator style={{ marginTop: 12 }} size="large" color={colors.text} /> : null}
          {isError ? (
            <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.notesTitle, { color: colors.text }]}>Favorites are unavailable</Text>
              <Text style={[styles.notesBody, { color: colors.subtext }]}>
                {error instanceof Error ? error.message : 'Please try again.'}
              </Text>
            </View>
          ) : null}
          {!isLoading && !isError && favorites.length === 0 ? (
            <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.notesTitle, { color: colors.text }]}>No saved experiences yet</Text>
              <Text style={[styles.notesBody, { color: colors.subtext }]}>
                Open any experience and save it. If the new travel schema is not migrated yet, the app stores favorites locally.
              </Text>
            </View>
          ) : null}
          {!isLoading && !isError
            ? favorites.map((experience) => (
                <Pressable
                  key={experience.id}
                  style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => navigation.navigate('ExperienceDetail', { event: experience })}
                >
                  <Text style={[styles.tileCountry, { color: colors.subtext }]}>
                    {experience.location_name || 'Saved travel experience'}
                  </Text>
                  <Text style={[styles.tileTitle, { color: colors.text }]}>{experience.title}</Text>
                  <Text style={[styles.tileBody, { color: colors.subtext }]}>
                    {experience.summary || experience.description || 'Saved for itinerary planning and later booking.'}
                  </Text>
                </Pressable>
              ))
            : null}
        </View>
      </View>

      <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.notesTitle, { color: colors.text }]}>Next professional upgrade</Text>
        <Text style={[styles.notesBody, { color: colors.subtext }]}>
          The next layer is comparison tables, saved filters, collaborative boards, and destination-level wishlists.
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
