import type { ComponentType } from 'react';
import type { EventRow } from '@/types/event';

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface EventsMapProps {
  events: EventRow[];
  initialRegion: MapRegion;
  onEventPress: (event: EventRow) => void;
}

declare const EventsMap: ComponentType<EventsMapProps>;

export default EventsMap;
