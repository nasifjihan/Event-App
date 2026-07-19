import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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

interface LocationPickerMapProps {
  initialRegion: MapRegion;
  pin: Coordinate;
  onPinChange?: (nextPin: Coordinate) => void;
}

export default function LocationPickerMap({ initialRegion, pin }: LocationPickerMapProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Interactive map isn't available on web yet</Text>
        <Text style={styles.body}>
          The native map library crashes in Expo web, so location picking falls back to your current coordinates.
        </Text>
        <Text style={styles.meta}>
          Initial region: {initialRegion.latitude.toFixed(4)}, {initialRegion.longitude.toFixed(4)}
        </Text>
        <Text style={styles.meta}>
          Selected pin: {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f6f7',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#fff8e6',
    borderColor: '#f3d08a',
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
  },
  title: { fontSize: 17, fontWeight: '700', color: '#5f4300', marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 20, color: '#6f5b21' },
  meta: { marginTop: 10, fontSize: 13, color: '#7a6a3f' },
});
