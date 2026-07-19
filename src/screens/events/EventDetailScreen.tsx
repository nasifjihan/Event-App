import React, { useMemo, useRef } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import { HomeStackParamList } from '@/navigation/HomeStackNavigator';
import { useAttendance } from '@/hooks/useAttendance';

export default function EventDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'EventDetail'>>();
  const { event } = route.params;

  const { count, isAttending, toggle, isToggling, isLoading } = useAttendance(event);

  const bottomSheetRef = useRef<BottomSheet>(null);
  // Two snap points: a short "peek" view and a nearly-full expanded view.
  // The user drags between them — this is the standard bottom sheet pattern
  // used all over real apps (Uber, Airbnb, Google Maps).
  const snapPoints = useMemo(() => ['34%', '88%'], []);

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

      <BottomSheet ref={bottomSheetRef} index={0} snapPoints={snapPoints}>
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
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
        </BottomSheetScrollView>
      </BottomSheet>
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
