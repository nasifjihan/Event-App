import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { useModerationQueue } from '@/hooks/useModerationQueue';
import { useTheme } from '@/theme/ThemeContext';

export default function ModerationCenterScreen() {
  const { colors } = useTheme();
  const { items, isLoading, isError, error, updateItem, isUpdating } = useModerationQueue();

  const handleDecision = async (id: string, entityType: 'experience' | 'provider', decision: 'approved' | 'rejected') => {
    try {
      await updateItem({ item: { id, entityType }, decision });
    } catch (updateError) {
      Alert.alert(
        'Could not update moderation item',
        updateError instanceof Error ? updateError.message : 'Something went wrong.'
      );
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>Moderation center</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>
        Review provider onboarding applications and pending experience submissions before they go live.
      </Text>

      {isLoading ? <ActivityIndicator style={{ marginTop: 22 }} size="large" color={colors.text} /> : null}
      {isError ? (
        <View style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.messageTitle, { color: colors.text }]}>Moderation queue unavailable</Text>
          <Text style={[styles.messageBody, { color: colors.subtext }]}>
            {error instanceof Error ? error.message : 'Please try again later.'}
          </Text>
        </View>
      ) : null}
      {!isLoading && !isError && items.length === 0 ? (
        <View style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.messageTitle, { color: colors.text }]}>Queue is clear</Text>
          <Text style={[styles.messageBody, { color: colors.subtext }]}>
            Pending provider applications and submitted experiences will appear here when admin review is required.
          </Text>
        </View>
      ) : null}
      {!isLoading && !isError
        ? items.map((item) => (
            <View
              key={`${item.entityType}-${item.id}`}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.header}>
                <View style={styles.copy}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.cardMeta, { color: colors.subtext }]}>
                    {item.entityType} · {item.submittedByLabel}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.badgeText, { color: colors.text }]}>{item.status}</Text>
                </View>
              </View>

              <Text style={[styles.cardBody, { color: colors.subtext }]}>
                {item.notes || 'No moderation notes were included with this submission.'}
              </Text>
              <Text style={[styles.cardMeta, { color: colors.subtext }]}>
                Submitted {dayjs(item.submittedAt).format('MMM D, YYYY · h:mm A')}
              </Text>

              <View style={styles.actionsRow}>
                <Pressable
                  style={[styles.secondaryButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => handleDecision(item.id, item.entityType, 'approved')}
                  disabled={isUpdating}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Approve</Text>
                </Pressable>
                <Pressable
                  style={[styles.primaryButton, { backgroundColor: colors.danger }]}
                  onPress={() => handleDecision(item.id, item.entityType, 'rejected')}
                  disabled={isUpdating}
                >
                  <Text style={styles.primaryButtonText}>Reject</Text>
                </Pressable>
              </View>
            </View>
          ))
        : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingTop: 28, paddingBottom: 40 },
  title: { fontSize: 30, lineHeight: 38, fontWeight: '800' },
  subtitle: { fontSize: 15, lineHeight: 23, marginTop: 12 },
  messageCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
  },
  messageTitle: { fontSize: 17, fontWeight: '700' },
  messageBody: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginTop: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardMeta: { fontSize: 13, marginTop: 6 },
  cardBody: { fontSize: 14, lineHeight: 21, marginTop: 12 },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '700' },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
