import type { ExpoConfig } from 'expo/config';

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const config: ExpoConfig = {
  name: 'Voyageo Travel',
  slug: 'voyageo-travel',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.mbw.voyageotravel',
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'We use your location to show nearby destinations and travel experiences.',
      NSCameraUsageDescription: 'We use your camera to let providers add travel experience photos.',
      NSPhotoLibraryUsageDescription:
        'We use your photo library to let you select travel experience photos.',
    },
  },
  android: {
    package: 'com.mbw.voyageotravel',
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'CAMERA', 'READ_EXTERNAL_STORAGE'],
    ...(googleMapsApiKey
      ? {
          config: {
            googleMaps: {
              apiKey: googleMapsApiKey,
            },
          },
        }
      : {}),
  },
  plugins: ['expo-location', 'expo-image-picker', 'expo-camera', 'expo-notifications'],
};

export default config;
