import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/hooks/useAuth';
import { travelerInsights } from '@/features/travel/data/travelCollections';
import { useTheme } from '@/theme/ThemeContext';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Traveler';

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
        <Text style={[styles.panelTitle, { color: colors.text }]}>Next profile upgrade</Text>
        <Text style={[styles.panelBody, { color: colors.subtext }]}>
          Add traveler documents, loyalty info, emergency contacts, preferences, and review history to turn this into a
          fully operational account area.
        </Text>
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
  button: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
