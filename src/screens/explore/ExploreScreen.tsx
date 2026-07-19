import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SectionHeader from '@/features/travel/components/SectionHeader';
import CategoryChip from '@/features/travel/components/CategoryChip';
import DestinationCard from '@/features/travel/components/DestinationCard';
import ExperienceCard from '@/features/travel/components/ExperienceCard';
import { travelCategories } from '@/features/travel/data/travelCollections';
import { TravelCategory } from '@/features/travel/types';
import { TravelStackParamList } from '@/navigation/TravelStackNavigator';
import { useTheme } from '@/theme/ThemeContext';
import { useTravelExperiences } from '@/hooks/useTravelExperiences';
import { TravelExperience } from '@/types/travel';
import { useFeaturedDestinations } from '@/hooks/useFeaturedDestinations';

const CATEGORY_KEYWORDS: Record<string, RegExp> = {
  coastal: /(beach|coast|island|ocean|surf|bay)/i,
  city: /(city|market|plaza|downtown|square|jazz|food)/i,
  wellness: /(yoga|wellness|retreat|garden|spa|slow)/i,
  adventure: /(run|walk|tour|mountain|trail|hike|workshop)/i,
};

export default function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TravelStackParamList>>();
  const { colors } = useTheme();
  const [searchInput, setSearchInput] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>(travelCategories[0]?.id ?? 'coastal');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useTravelExperiences(searchInput);
  const { data: destinations = [] } = useFeaturedDestinations();

  const allExperiences = useMemo(
    () => data?.pages.flatMap((page) => page.experiences) ?? [],
    [data]
  );

  const activeCategory = useMemo<TravelCategory | undefined>(
    () => travelCategories.find((category) => category.id === activeCategoryId),
    [activeCategoryId]
  );

  const curatedExperiences = useMemo(() => {
    const matcher = CATEGORY_KEYWORDS[activeCategoryId];
    if (!matcher) return allExperiences;

    const matched = allExperiences.filter((experience) =>
      matcher.test(
        `${experience.title} ${experience.description ?? ''} ${experience.location_name ?? ''}`
      )
    );

    return matched.length > 0 ? matched : allExperiences;
  }, [activeCategoryId, allExperiences]);

  const featuredExperiences = curatedExperiences.slice(0, 6);
  const upcomingExperiences = [...allExperiences]
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, 4);

  const openExperience = (experience: TravelExperience) => {
    navigation.navigate('ExperienceDetail', { event: experience });
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={[styles.eyebrow, { color: colors.subtext }]}>Travel Operating System</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          Design polished trips, curate destinations, and manage experiences in one place.
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          This version turns your event infrastructure into a premium travel discovery flow with
          stronger planning surfaces and a clearer product direction.
        </Text>
        <View style={[styles.searchShell, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="Search destinations, tours, or local experiences"
            placeholderTextColor={colors.subtext}
            style={[styles.searchInput, { color: colors.text }]}
          />
          <Pressable
            style={[styles.ctaButton, { backgroundColor: colors.text }]}
            onPress={() => navigation.navigate('CreateExperience')}
          >
            <Text style={[styles.ctaText, { color: colors.background }]}>Create</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Destination spotlights"
          subtitle="High-impact travel collections that make the app feel curated from the first screen."
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
          {destinations.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Experience collections"
          subtitle={activeCategory?.description ?? 'Themed collections built from your live inventory.'}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {travelCategories.map((category) => (
            <CategoryChip
              key={category.id}
              category={category}
              isActive={category.id === activeCategoryId}
              onPress={() => setActiveCategoryId(category.id)}
            />
          ))}
        </ScrollView>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} size="large" color={colors.text} />
        ) : isError ? (
          <View style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.errorTitle, { color: colors.text }]}>Travel inventory is unavailable</Text>
            <Text style={[styles.errorBody, { color: colors.subtext }]}>
              {error instanceof Error ? error.message : 'Please refresh and try again.'}
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
            {featuredExperiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                descriptor={activeCategory?.label ?? 'Featured'}
                onPress={() => openExperience(experience)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Upcoming availability"
          subtitle="A professional planning surface should also make time-bound inventory easy to scan."
        />
        <View style={styles.verticalList}>
          {upcomingExperiences.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No live experiences yet</Text>
              <Text style={[styles.emptyBody, { color: colors.subtext }]}>
                Add your first hosted experience to start building the travel catalog.
              </Text>
            </View>
          ) : (
            upcomingExperiences.map((experience) => (
              <Pressable
                key={experience.id}
                style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => openExperience(experience)}
              >
                <View style={[styles.timelineBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.timelineBadgeText, { color: colors.text }]}>Live</Text>
                </View>
                <Text style={[styles.timelineTitle, { color: colors.text }]}>{experience.title}</Text>
                <Text style={[styles.timelineMeta, { color: colors.subtext }]}>
                  {experience.location_name || 'Destination pending'} · {new Date(experience.starts_at).toLocaleDateString()}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 40 },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
    maxWidth: 640,
  },
  searchShell: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 24,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  ctaButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  horizontalRow: {
    paddingTop: 16,
    paddingRight: 20,
  },
  chipRow: {
    paddingTop: 16,
    paddingBottom: 6,
    paddingRight: 20,
  },
  loader: {
    marginTop: 30,
  },
  errorCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorBody: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  verticalList: {
    marginTop: 16,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  timelineCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  timelineBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  timelineBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  timelineMeta: {
    fontSize: 14,
    marginTop: 8,
  },
});
