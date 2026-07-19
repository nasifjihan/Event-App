import React from 'react';
import MapView, { Marker, Region } from 'react-native-maps';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface LocationPickerMapProps {
  initialRegion: Region;
  pin: Coordinate;
  onPinChange: (nextPin: Coordinate) => void;
}

export default function LocationPickerMap({
  initialRegion,
  pin,
  onPinChange,
}: LocationPickerMapProps) {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={initialRegion}
      onPress={(e) => onPinChange(e.nativeEvent.coordinate)}
    >
      <Marker
        coordinate={pin}
        draggable
        onDragEnd={(e) => onPinChange(e.nativeEvent.coordinate)}
      />
    </MapView>
  );
}
