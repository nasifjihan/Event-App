import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LocationPickerMap from '@/components/maps/LocationPickerMap';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { TravelStackParamList } from '@/navigation/TravelStackNavigator';
import { useTheme } from '@/theme/ThemeContext';

type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const DEFAULT_REGION: MapRegion = {
  latitude: 25.2048,
  longitude: 55.2708,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function PickExperienceLocationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TravelStackParamList>>();
  const { coords: myCoords } = useCurrentLocation();
  const { colors } = useTheme();

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
    let resolvedName = 'Pinned destination';

    try {
      const results = await Location.reverseGeocodeAsync(pin);
      if (results.length > 0) {
        const place = results[0];
        resolvedName = [place.name, place.city, place.country].filter(Boolean).join(', ') || resolvedName;
      }
    } catch {
      // Keep the fallback label when reverse geocoding fails.
    }

    setIsResolvingName(false);
    navigation.navigate('CreateExperience', {
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

      <View style={[styles.overlay, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Pin the exact destination</Text>
        <Text style={[styles.body, { color: colors.subtext }]}>
          A clean travel flow should let hosts drop precise pickup points, meeting areas, or featured landmarks.
        </Text>
        <Pressable
          style={[styles.secondaryButton, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={handleUseCurrentLocation}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Use my current location</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: colors.text }, isResolvingName && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={isResolvingName}
        >
          {isResolvingName ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.primaryButtonText, { color: colors.background }]}>Confirm destination</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  secondaryButton: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
