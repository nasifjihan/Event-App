import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import SectionHeader from '@/features/travel/components/SectionHeader';
import { useHostedExperiences } from '@/hooks/useHostedExperiences';
import { useProviderBookings } from '@/hooks/useProviderBookings';
import { useProviderProfile } from '@/hooks/useProviderProfile';
import { useTravelAnalyticsSnapshots } from '@/hooks/useTravelAnalyticsSnapshots';
import { useTravelOperationsSummary } from '@/hooks/useTravelOperationsSummary';
import { useTheme } from '@/theme/ThemeContext';
import { ManageStackParamList } from '@/navigation/ManageStackNavigator';

export default function ManageScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ManageStackParamList>>();
  const { experiences, isLoading, isError, error, refetch, toggleStatus } = useHostedExperiences();
  const {
    bookings,
    isLoading: isBookingsLoading,
    isError: isBookingsError,
    error: bookingsError,
    updateStatus,
    isUpdating,
  } = useProviderBookings();
  const { profile } = useProviderProfile();
  const { data: operationsSummary } = useTravelOperationsSummary();
  const { snapshots, captureSnapshot, isCapturing } = useTravelAnalyticsSnapshots();

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

  const handleBookingStatusUpdate = async (
    bookingId: string,
    bookingStatus: 'pending' | 'confirmed' | 'cancelled'
  ) => {
    try {
      await updateStatus({ bookingId, bookingStatus });
    } catch (updateError) {
      Alert.alert(
        'Could not update booking',
        updateError instanceof Error ? updateError.message : 'Something went wrong.'
      );
    }
  };

  const handleCaptureSnapshot = async () => {
    try {
      await captureSnapshot();
    } catch (captureError) {
      Alert.alert(
        'Could not capture analytics snapshot',
        captureError instanceof Error ? captureError.message : 'Something went wrong.'
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
          <Text style={[styles.statValue, { color: colors.text }]}>{operationsSummary?.liveExperiences ?? 0}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Live now</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{operationsSummary?.pendingBookings ?? 0}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Pending bookings</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {operationsSummary ? `${operationsSummary.currency} ${operationsSummary.projectedRevenue}` : 'USD 0'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Projected revenue</Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Release workflows"
          subtitle="Provider onboarding, moderation, and analytics snapshots support the move from MVP into controlled production operations."
        />
        <View style={styles.actionsGrid}>
          <Pressable
            style={[styles.workflowCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ProviderOnboarding')}
          >
            <Text style={[styles.workflowTitle, { color: colors.text }]}>Provider onboarding</Text>
            <Text style={[styles.workflowBody, { color: colors.subtext }]}>
              Status: {profile?.approvalStatus?.replace('_', ' ') ?? 'not started'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.workflowCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ModerationCenter')}
          >
            <Text style={[styles.workflowTitle, { color: colors.text }]}>Moderation center</Text>
            <Text style={[styles.workflowBody, { color: colors.subtext }]}>
              Review provider applications and pending experience submissions.
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{experiences.length}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Hosted experiences</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{operationsSummary?.draftExperiences ?? 0}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Needs action</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{operationsSummary?.nativeExperiences ?? 0}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Native travel items</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{operationsSummary?.legacyExperiences ?? 0}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Legacy items pending cutover</Text>
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
                      experience.source === 'experience'
                        ? navigation.navigate('EditHostedExperience', { experience })
                        : Alert.alert(
                            'Migration required',
                            'Run supabase/travel_cutover_from_events.sql before editing legacy items.'
                          )
                    }
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Edit</Text>
                  </Pressable>
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

      <View style={styles.section}>
        <SectionHeader
          title="Booking operations"
          subtitle="Provider-side booking management with status updates, traveler context, and revenue visibility."
        />

        {isBookingsLoading ? <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.text} /> : null}
        {isBookingsError ? (
          <View style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.messageTitle, { color: colors.text }]}>Booking operations unavailable</Text>
            <Text style={[styles.messageBody, { color: colors.subtext }]}>
              {bookingsError instanceof Error ? bookingsError.message : 'Please try again later.'}
            </Text>
          </View>
        ) : null}
        {!isBookingsLoading && !isBookingsError && bookings.length === 0 ? (
          <View style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.messageTitle, { color: colors.text }]}>No bookings yet</Text>
            <Text style={[styles.messageBody, { color: colors.subtext }]}>
              As travelers reserve experiences, the provider queue appears here for confirmation and cancellation workflows.
            </Text>
          </View>
        ) : null}
        {!isBookingsLoading && !isBookingsError
          ? bookings.slice(0, 6).map((booking) => (
              <View
                key={booking.id}
                style={[styles.inventoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.inventoryHeader}>
                  <View style={styles.inventoryCopy}>
                    <Text style={[styles.inventoryTitle, { color: colors.text }]}>{booking.experienceTitle}</Text>
                    <Text style={[styles.inventoryMeta, { color: colors.subtext }]}>
                      {booking.travelerLabel} · {booking.travelersCount} traveler{booking.travelersCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.badgeText, { color: colors.text }]}>{booking.bookingStatus}</Text>
                  </View>
                </View>

                <Text style={[styles.inventoryBody, { color: colors.subtext }]}>
                  {booking.startsAt ? dayjs(booking.startsAt).format('MMM D, YYYY · h:mm A') : 'Date pending'} ·{' '}
                  {booking.currency ?? 'USD'} {booking.totalAmount ?? 0}
                </Text>

                <View style={styles.actionsRow}>
                  <Pressable
                    style={[styles.secondaryButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => handleBookingStatusUpdate(booking.id, 'confirmed')}
                    disabled={isUpdating}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Confirm</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.secondaryButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => handleBookingStatusUpdate(booking.id, 'pending')}
                    disabled={isUpdating}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Pending</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.primaryButton, { backgroundColor: colors.danger }]}
                    onPress={() => handleBookingStatusUpdate(booking.id, 'cancelled')}
                    disabled={isUpdating}
                  >
                    <Text style={[styles.primaryButtonText, { color: '#fff' }]}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            ))
          : null}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Analytics snapshots"
          subtitle="Persisted summary records give you a lightweight operational trail before full BI tooling is connected."
          actionLabel={isCapturing ? 'Saving...' : 'Capture'}
          onPressAction={handleCaptureSnapshot}
        />

        {snapshots.length === 0 ? (
          <View style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.messageTitle, { color: colors.text }]}>No snapshots yet</Text>
            <Text style={[styles.messageBody, { color: colors.subtext }]}>
              Capture a provider analytics snapshot to persist current live inventory, booking counts, and projected revenue.
            </Text>
          </View>
        ) : (
          snapshots.map((snapshot) => (
            <View
              key={snapshot.id}
              style={[styles.inventoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.inventoryTitle, { color: colors.text }]}>
                {dayjs(snapshot.capturedAt).format('MMM D, YYYY · h:mm A')}
              </Text>
              <Text style={[styles.inventoryBody, { color: colors.subtext }]}>
                Live experiences: {snapshot.liveExperiences} · Pending bookings: {snapshot.pendingBookings} · Confirmed bookings: {snapshot.confirmedBookings}
              </Text>
              <Text style={[styles.inventoryMeta, { color: colors.subtext }]}>
                Revenue snapshot: {snapshot.currency} {snapshot.projectedRevenue}
              </Text>
            </View>
          ))
        )}
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
  actionsGrid: {
    gap: 12,
    marginTop: 16,
  },
  workflowCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  workflowTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  workflowBody: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
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
