import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

interface Coords {
  latitude: number;
  longitude: number;
}

/**
 * Requests foreground location permission once and returns the user's
 * current coordinates. If permission is denied, `coords` stays null and
 * the UI (distance labels, map centering) just quietly skips that feature
 * rather than blocking anything.
 */
export function useCurrentLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (isMounted) {
          setPermissionDenied(true);
          setIsLoading(false);
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (isMounted) {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return { coords, permissionDenied, isLoading };
}
