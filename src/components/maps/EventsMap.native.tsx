import React from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { EventRow } from '@/types/event';

interface EventsMapProps {
  events: EventRow[];
  initialRegion: Region;
  onEventPress: (event: EventRow) => void;
}

export default function EventsMap({ events, initialRegion, onEventPress }: EventsMapProps) {
  return (
    <MapView style={{ flex: 1 }} initialRegion={initialRegion}>
      {events.map((event) => (
        <Marker
          key={event.id}
          coordinate={{ latitude: event.latitude!, longitude: event.longitude! }}
        >
          <Callout onPress={() => onEventPress(event)}>
            <View style={{ maxWidth: 200 }}>
              <Text style={{ fontWeight: '600' }}>{event.title}</Text>
              {event.location_name ? <Text>{event.location_name}</Text> : null}
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}
