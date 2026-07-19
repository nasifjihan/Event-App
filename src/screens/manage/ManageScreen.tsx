import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import SectionHeader from '@/features/travel/components/SectionHeader';
import { useHostedExperiences } from '@/hooks/useHostedExperiences';
import { useTheme } from '@/theme/ThemeContext';

export default function ManageScreen() {
  const { colors } = useTheme();
  const { experiences, isLoading, isError, error, refetch, toggleStatus } = useHostedExperiences();

  const liveCount = experiences.filter((item) => item.status === 'live').length;
  const draftCount = experiences.filter((item) => item.status !== 'live').length;

  const handleToggleStatus = async (experienceId: string) => {
    const experience = experiences.find((item) => item.id === experienceId);
    if (!experience) return;

    try {
      await toggleStatus(experience);
    } catch (toggleError) {
      Alert.alert(
        'Could not update experience',
        toggleError instanceof Error ? toggleError.message : 'Something went wrong.'
      );
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: colors.subtext }]}>Provider Operations</Text>
      <Text style={[styles.title, { color: colors.text }]}>Manage hosted inventory, publishing state, and the migration to native travel experiences.</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>
        This is the start of the provider dashboard. It gives hosts a clean place to control what is live and what still needs migration from the legacy event model.
      </Text>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{experiences.length}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Hosted experiences</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{liveCount}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Live now</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{draftCount}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Needs action</Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Hosted inventory"
          subtitle="Native travel experiences can be toggled between live and draft. Legacy items stay readable until the cutover SQL is applied."
          actionLabel="Refresh"
          onPressAction={() => refetch()}
        />

        {isLoading ? <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.text} /> : null}
        {isError ? (
          <View style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.messageTitle, { color: colors.text }]}>Hosted inventory unavailable</Text>
            <Text style={[styles.messageBody, { color: colors.subtext }]}>
              {error instanceof Error ? error.message : 'Please try again later.'}
            </Text>
          </View>
        ) : null}
        {!isLoading && !isError && experiences.length === 0 ? (
          <View style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.messageTitle, { color: colors.text }]}>Nothing hosted yet</Text>
            <Text style={[styles.messageBody, { color: colors.subtext }]}>
              Create an experience from Explore to populate the provider dashboard.
            </Text>
          </View>
        ) : null}
        {!isLoading && !isError
          ? experiences.map((experience) => (
              <View
                key={experience.id}
                style={[styles.inventoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.inventoryHeader}>
                  <View style={styles.inventoryCopy}>
                    <Text style={[styles.inventoryTitle, { color: colors.text }]}>{experience.title}</Text>
                    <Text style={[styles.inventoryMeta, { color: colors.subtext }]}>
                      {experience.location_name || 'Flexible destination'} · {experience.source === 'experience' ? experience.status : 'legacy item'}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.badgeText, { color: colors.text }]}>
                      {experience.source === 'experience' ? 'Native' : 'Legacy'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.inventoryBody, { color: colors.subtext }]}>
                  {experience.summary || experience.description || 'This listing is ready for publishing controls and provider-side management.'}
                </Text>

                <View style={styles.actionsRow}>
                  <Pressable
                    style={[styles.secondaryButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() =>
                      Alert.alert(
                        'Cutover note',
                        experience.source === 'experience'
                          ? 'This item already uses the native travel schema.'
                          : 'Run supabase/travel_cutover_from_events.sql to migrate legacy events into native travel experiences.'
                      )
                    }
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Cutover</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.primaryButton,
                      { backgroundColor: experience.source === 'experience' ? colors.text : colors.border },
                    ]}
                    disabled={experience.source !== 'experience'}
                    onPress={() => handleToggleStatus(experience.id)}
                  >
                    <Text
                      style={[
                        styles.primaryButtonText,
                        { color: experience.source === 'experience' ? colors.background : colors.subtext },
                      ]}
                    >
                      {experience.source === 'experience'
                        ? experience.status === 'live'
                          ? 'Move to draft'
                          : 'Publish live'
                        : 'Migration required'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingTop: 28, paddingBottom: 40 },
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
    maxWidth: 680,
  },
  statsGrid: {
    gap: 12,
    marginTop: 24,
  },
  statCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 6,
  },
  section: {
    marginTop: 28,
  },
  messageCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
  },
  messageTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  messageBody: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  inventoryCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginTop: 16,
  },
  inventoryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  inventoryCopy: {
    flex: 1,
  },
  inventoryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  inventoryMeta: {
    fontSize: 14,
    marginTop: 6,
  },
  inventoryBody: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1.35,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
