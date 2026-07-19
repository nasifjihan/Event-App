import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LocationPickerMap from '@/components/maps/LocationPickerMap';
import { HomeStackParamList } from '@/navigation/HomeStackNavigator';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';

type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const DEFAULT_REGION: MapRegion = {
  // Fallback center if we don't have the user's location yet (San Francisco).
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function PickLocationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { coords: myCoords } = useCurrentLocation();

  const [pin, setPin] = useState<{ latitude: number; longitude: number }>(
    myCoords ?? { latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude }
  );
  const [isResolvingName, setIsResolvingName] = useState(false);

  const initialRegion: MapRegion = myCoords
    ? { ...myCoords, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : DEFAULT_REGION;

  const handleUseCurrentLocation = async () => {
    if (!myCoords) {
      Alert.alert('Location unavailable', "Couldn't get your current location.");
      return;
    }
    setPin(myCoords);
  };

  const handleConfirm = async () => {
    setIsResolvingName(true);
    // Reverse geocoding turns coordinates into a human-readable name
    // (e.g. "Ocean Beach, San Francisco") so the user doesn't have to type one.
    let resolvedName = 'Dropped pin';
    try {
      const results = await Location.reverseGeocodeAsync(pin);
      if (results.length > 0) {
        const place = results[0];
        resolvedName = [place.name, place.city].filter(Boolean).join(', ') || resolvedName;
      }
    } catch {
      // Reverse geocoding failing isn't critical — fall back to the generic name.
    }
    setIsResolvingName(false);

    // Navigating back to an already-mounted screen with params is the
    // standard React Navigation pattern for "returning a result" —
    // CreateEventScreen reads this via a useEffect on route.params.
    navigation.navigate('CreateEvent', {
      pickedLocation: {
        latitude: pin.latitude,
        longitude: pin.longitude,
        locationName: resolvedName,
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <LocationPickerMap initialRegion={initialRegion} pin={pin} onPinChange={setPin} />

      <View style={styles.overlay}>
        <Text style={styles.hint}>Tap the map or drag the pin to set the event location</Text>
        <Pressable style={styles.currentLocationButton} onPress={handleUseCurrentLocation}>
          <Text style={styles.currentLocationText}>📍 Use My Current Location</Text>
        </Pressable>
        <Pressable
          style={[styles.confirmButton, isResolvingName && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={isResolvingName}
        >
          {isResolvingName ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmText}>Confirm Location</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
  },
  hint: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 12 },
  currentLocationButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  currentLocationText: { fontWeight: '500' },
  confirmButton: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonDisabled: { opacity: 0.6 },
  confirmText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
