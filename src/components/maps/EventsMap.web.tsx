import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { EventRow } from '@/types/event';

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface EventsMapProps {
  events: EventRow[];
  initialRegion: MapRegion;
  onEventPress: (event: EventRow) => void;
}

export default function EventsMap({ events, initialRegion, onEventPress }: EventsMapProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Map view isn't available on web yet</Text>
        <Text style={styles.body}>
          The native map package crashes in Expo web, so this screen falls back to a location list.
        </Text>
        <Text style={styles.meta}>
          Current center: {initialRegion.latitude.toFixed(4)}, {initialRegion.longitude.toFixed(4)}
        </Text>
      </View>

      <View style={styles.list}>
        {events.length === 0 ? (
          <Text style={styles.empty}>No mappable events found.</Text>
        ) : (
          events.map((event) => (
            <Pressable key={event.id} style={styles.item} onPress={() => onEventPress(event)}>
              <Text style={styles.itemTitle}>{event.title}</Text>
              <Text style={styles.itemMeta}>
                {event.location_name ?? 'Pinned event'} · {event.latitude?.toFixed(4)}, {event.longitude?.toFixed(4)}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff8e6',
    borderColor: '#f3d08a',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 6, color: '#5f4300' },
  body: { fontSize: 14, lineHeight: 20, color: '#6f5b21' },
  meta: { marginTop: 10, fontSize: 12, color: '#7a6a3f' },
  list: { gap: 10 },
  empty: { color: '#666', textAlign: 'center', marginTop: 20 },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e7e7e7',
  },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
  itemMeta: { marginTop: 4, fontSize: 13, color: '#666' },
});
