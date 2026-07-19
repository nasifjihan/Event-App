import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

/**
 * Wires React Native's network status into TanStack Query's online manager.
 * Once this runs (once, at app startup), queries automatically pause while
 * offline — serving whatever's in the cache instead of erroring — and
 * resume fetching the moment connectivity returns. This is the officially
 * recommended integration pattern for React Native + TanStack Query.
 */
export function setupNetworkStatusListener(): void {
  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
  });
}
