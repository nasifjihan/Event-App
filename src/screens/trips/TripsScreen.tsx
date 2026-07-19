import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PlanningCard from '@/features/travel/components/PlanningCard';
import SectionHeader from '@/features/travel/components/SectionHeader';
import { useTheme } from '@/theme/ThemeContext';
import { useTripPlans } from '@/hooks/useTripPlans';
import { TripsStackParamList } from '@/navigation/TripsStackNavigator';

export default function TripsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<TripsStackParamList>>();
  const { data: tripPlans = [], isLoading, isError, error } = useTripPlans();

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
          This board now reads from live trip plans when the new schema exists, and safely falls back while migration is in progress.
        </Text>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Planning board"
          subtitle="Modeled as a single place for travel operations, collaboration, and itinerary checkpoints."
          actionLabel="New Plan"
          onPressAction={() => navigation.navigate('CreateTripPlan')}
        />
        <View style={styles.list}>
          {isLoading ? <ActivityIndicator style={{ marginTop: 12 }} size="large" color={colors.text} /> : null}
          {isError ? (
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Trip plans are unavailable</Text>
              <Text style={[styles.summaryBody, { color: colors.subtext }]}>
                {error instanceof Error ? error.message : 'Please try again later.'}
              </Text>
            </View>
          ) : null}
          {!isLoading && !isError && tripPlans.length === 0 ? (
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>No trip plans yet</Text>
              <Text style={[styles.summaryBody, { color: colors.subtext }]}>
                Create trip plans in the new Supabase schema to replace the temporary planning fallback.
              </Text>
            </View>
          ) : null}
          {!isLoading && !isError && tripPlans.map((item) => (
            <Pressable
              key={item.id}
              onPress={() =>
                navigation.navigate('CreateTripPlan', {
                  prefillTitle: item.title,
                  prefillNotes: item.subtitle,
                })
              }
            >
              <PlanningCard item={item} />
            </Pressable>
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
