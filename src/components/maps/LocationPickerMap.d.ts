import type { ComponentType } from 'react';

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface LocationPickerMapProps {
  initialRegion: MapRegion;
  pin: Coordinate;
  onPinChange?: (nextPin: Coordinate) => void;
}

declare const LocationPickerMap: ComponentType<LocationPickerMapProps>;

export default LocationPickerMap;
