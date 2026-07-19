import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { HomeStackParamList } from '@/navigation/HomeStackNavigator';
import { useAttendance } from '@/hooks/useAttendance';

export default function EventDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'EventDetail'>>();
  const { event } = route.params;

  const { count, isAttending, toggle, isToggling, isLoading } = useAttendance(event);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: event.cover_image_url ?? 'https://placehold.co/800x600?text=Event' }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>‹</Text>
      </Pressable>

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.meta}>
            {dayjs(event.starts_at).format('dddd, MMM D · h:mm A')}
          </Text>
          {event.location_name ? (
            <Text style={styles.meta}>📍 {event.location_name}</Text>
          ) : null}

          <Text style={styles.attendeeCount}>
            {isLoading
              ? 'Loading attendees...'
              : `${count} ${count === 1 ? 'person' : 'people'} going`}
          </Text>

          <Pressable
            style={[
              styles.joinButton,
              isAttending && styles.joinButtonActive,
              isToggling && styles.joinButtonDisabled,
            ]}
            onPress={toggle}
            disabled={isToggling || isLoading}
          >
            <Text style={[styles.joinButtonText, isAttending && styles.joinButtonTextActive]}>
              {isAttending ? '✓ Going — tap to leave' : 'Join Event'}
            </Text>
          </Pressable>

          {event.description ? (
            <>
              <Text style={styles.sectionLabel}>About</Text>
              <Text style={styles.description}>{event.description}</Text>
            </>
          ) : null}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backButtonText: { color: '#fff', fontSize: 24, lineHeight: 26 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '88%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#d0d0d0',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetContent: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  meta: { fontSize: 14, color: '#666', marginBottom: 4 },
  attendeeCount: { fontSize: 14, fontWeight: '500', color: '#333', marginTop: 16, marginBottom: 12 },
  joinButton: {
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  joinButtonActive: { backgroundColor: '#e6f4ea' },
  joinButtonDisabled: { opacity: 0.6 },
  joinButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  joinButtonTextActive: { color: '#1a7f37' },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  description: { fontSize: 14, color: '#444', lineHeight: 20 },
});
