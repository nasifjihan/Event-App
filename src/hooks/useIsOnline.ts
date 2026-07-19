import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/** Simple boolean for UI purposes — e.g. showing the offline banner. */
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  return isOnline;
}
