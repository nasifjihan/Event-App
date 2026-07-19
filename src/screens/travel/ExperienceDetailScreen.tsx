import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import dayjs from 'dayjs';
import { useAttendance } from '@/hooks/useAttendance';
import { TravelStackParamList } from '@/navigation/TravelStackNavigator';
import { useTheme } from '@/theme/ThemeContext';

const DEFAULT_IMAGE =
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=premium%20travel%20experience%20destination%20hero%20image%2C%20luxury%20editorial%20tourism%20photography%2C%20warm%20light%2C%20realistic&image_size=landscape_16_9';

export default function ExperienceDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TravelStackParamList>>();
  const route = useRoute<RouteProp<TravelStackParamList, 'ExperienceDetail'>>();
  const { colors } = useTheme();
  const { event } = route.params;
  const { count, isAttending, isLoading, isToggling, toggle } = useAttendance(event);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroShell}>
          <Image
            source={{ uri: event.cover_image_url ?? DEFAULT_IMAGE }}
            style={styles.heroImage}
            contentFit="cover"
            transition={180}
          />
          <View style={styles.heroOverlay} />
          <Pressable
            style={[styles.backButton, { backgroundColor: 'rgba(8, 12, 18, 0.42)' }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Travel Experience</Text>
            <Text style={styles.heroTitle}>{event.title}</Text>
            <Text style={styles.heroMeta}>
              {event.location_name || 'Flexible destination'} · {dayjs(event.starts_at).format('dddd, MMM D · h:mm A')}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: colors.text }]}>{isLoading ? '...' : count}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Travelers interested</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {event.location_name ? 'Hosted' : 'Flexible'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Experience mode</Text>
            </View>
          </View>

          <Pressable
            onPress={toggle}
            disabled={isToggling || isLoading}
            style={[
              styles.primaryButton,
              { backgroundColor: isAttending ? colors.card : colors.text, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.primaryButtonText,
                { color: isAttending ? colors.text : colors.background },
              ]}
            >
              {isAttending ? 'Reserved - tap to remove' : 'Reserve this experience'}
            </Text>
          </Pressable>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Experience overview</Text>
            <Text style={[styles.sectionBody, { color: colors.subtext }]}>
              {event.description ||
                'A premium travel detail page should explain the flow, the hosting context, and why this activity belongs inside a larger trip plan.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>What this screen improves</Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bullet, { color: colors.subtext }]}>Curated hero layout instead of a prototype event sheet.</Text>
              <Text style={[styles.bullet, { color: colors.subtext }]}>Travel-specific CTA language for reservations and planning.</Text>
              <Text style={[styles.bullet, { color: colors.subtext }]}>A structure ready for reviews, inclusions, hosts, and itineraries.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  heroShell: {
    height: 420,
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 15, 24, 0.36)',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  heroCopy: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 30,
  },
  heroEyebrow: {
    color: '#d6e6ff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    marginTop: 10,
  },
  heroMeta: {
    color: '#edf4ff',
    fontSize: 15,
    marginTop: 12,
  },
  body: {
    padding: 20,
    paddingBottom: 40,
  },
  statsRow: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBlock: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#d9dde5',
    marginHorizontal: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 6,
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
    borderWidth: 1,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
  bulletList: {
    marginTop: 12,
    gap: 10,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
  },
});
