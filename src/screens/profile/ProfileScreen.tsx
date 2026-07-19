import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/hooks/useAuth';
import { travelerInsights } from '@/features/travel/data/travelCollections';
import { useTheme } from '@/theme/ThemeContext';
import { useBookingHistory } from '@/hooks/useBookingHistory';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import dayjs from 'dayjs';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Traveler';
  const { data: bookingHistory = [], isLoading, isError, error } = useBookingHistory();
  const { preferences, isLoading: isPreferencesLoading, updatePreferences, isUpdating } = useNotificationPreferences();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const togglePreference = async (
    key: 'bookingConfirmations' | 'tripReminders' | 'promotions' | 'providerAlerts'
  ) => {
    if (!preferences || isUpdating) return;
    await updatePreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.kicker, { color: colors.subtext }]}>Traveler Profile</Text>
        <Text style={[styles.title, { color: colors.text }]}>Welcome back, {firstName}</Text>
        <Text style={[styles.email, { color: colors.subtext }]}>{user?.email}</Text>
        <Text style={[styles.summary, { color: colors.subtext }]}>
          This upgraded profile acts like a professional control center for travel preferences, saved plans,
          and upcoming itinerary operations.
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        {travelerInsights.map((insight) => (
          <View
            key={insight.id}
            style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.metricValue, { color: colors.text }]}>{insight.value}</Text>
            <Text style={[styles.metricLabel, { color: colors.subtext }]}>{insight.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.panelTitle, { color: colors.text }]}>Reservation history</Text>
        {isLoading ? <ActivityIndicator style={{ marginTop: 10 }} size="small" color={colors.text} /> : null}
        {isError ? (
          <Text style={[styles.panelBody, { color: colors.subtext }]}>
            {error instanceof Error ? error.message : 'Could not load reservation history.'}
          </Text>
        ) : null}
        {!isLoading && !isError && bookingHistory.length === 0 ? (
          <Text style={[styles.panelBody, { color: colors.subtext }]}>
            No reservations yet. As you book experiences, they will appear here with status and schedule details.
          </Text>
        ) : null}
        {!isLoading && !isError && bookingHistory.length > 0 ? (
          <View style={styles.historyList}>
            {bookingHistory.slice(0, 4).map((booking) => (
              <View
                key={booking.id}
                style={[styles.historyCard, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <Text style={[styles.historyTitle, { color: colors.text }]}>{booking.title}</Text>
                <Text style={[styles.historyMeta, { color: colors.subtext }]}>
                  {booking.locationName || 'Flexible destination'} · {booking.bookingStatus}
                </Text>
                <Text style={[styles.historyMeta, { color: colors.subtext }]}>
                  {booking.startsAt ? dayjs(booking.startsAt).format('MMM D, YYYY · h:mm A') : 'Date pending'}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.panelTitle, { color: colors.text }]}>Notification settings</Text>
        <Text style={[styles.panelBody, { color: colors.subtext }]}>
          These preferences are ready for the new notification queue and fall back locally before the schema is deployed.
        </Text>
        {isPreferencesLoading || !preferences ? (
          <ActivityIndicator style={{ marginTop: 12 }} size="small" color={colors.text} />
        ) : (
          <View style={styles.preferencesList}>
            <View style={[styles.preferenceRow, { borderColor: colors.border }]}>
              <View style={styles.preferenceCopy}>
                <Text style={[styles.preferenceTitle, { color: colors.text }]}>Booking confirmations</Text>
                <Text style={[styles.preferenceBody, { color: colors.subtext }]}>Receive updates when reservations change.</Text>
              </View>
              <Switch value={preferences.bookingConfirmations} onValueChange={() => togglePreference('bookingConfirmations')} />
            </View>
            <View style={[styles.preferenceRow, { borderColor: colors.border }]}>
              <View style={styles.preferenceCopy}>
                <Text style={[styles.preferenceTitle, { color: colors.text }]}>Trip reminders</Text>
                <Text style={[styles.preferenceBody, { color: colors.subtext }]}>Get day-of-travel and itinerary reminders.</Text>
              </View>
              <Switch value={preferences.tripReminders} onValueChange={() => togglePreference('tripReminders')} />
            </View>
            <View style={[styles.preferenceRow, { borderColor: colors.border }]}>
              <View style={styles.preferenceCopy}>
                <Text style={[styles.preferenceTitle, { color: colors.text }]}>Promotions</Text>
                <Text style={[styles.preferenceBody, { color: colors.subtext }]}>Receive curated travel offers and seasonal campaigns.</Text>
              </View>
              <Switch value={preferences.promotions} onValueChange={() => togglePreference('promotions')} />
            </View>
            <View style={[styles.preferenceRow, { borderColor: colors.border }]}>
              <View style={styles.preferenceCopy}>
                <Text style={[styles.preferenceTitle, { color: colors.text }]}>Provider alerts</Text>
                <Text style={[styles.preferenceBody, { color: colors.subtext }]}>Receive host-side inventory and booking alerts.</Text>
              </View>
              <Switch value={preferences.providerAlerts} onValueChange={() => togglePreference('providerAlerts')} />
            </View>
          </View>
        )}
      </View>

      <Pressable style={[styles.button, { backgroundColor: colors.danger }]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingTop: 28, paddingBottom: 40 },
  hero: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: { fontSize: 30, fontWeight: '800', marginTop: 10, lineHeight: 38 },
  email: { fontSize: 15, marginTop: 10 },
  summary: { fontSize: 14, lineHeight: 22, marginTop: 12 },
  metricsGrid: {
    gap: 12,
    marginTop: 22,
  },
  metricCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 14,
    marginTop: 6,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginTop: 22,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  panelBody: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  historyList: {
    marginTop: 12,
    gap: 10,
  },
  historyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  historyMeta: {
    fontSize: 13,
    marginTop: 6,
  },
  preferencesList: {
    marginTop: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  preferenceCopy: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  preferenceBody: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  button: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
