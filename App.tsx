import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import RootNavigator from '@/navigation/RootNavigator';
import OfflineBanner from '@/components/OfflineBanner';
import { mmkvQueryPersister } from '@/services/queryPersister';
import { setupNetworkStatusListener } from '@/services/networkStatus';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
      gcTime: ONE_DAY_MS,
    },
  },
});

export default function App() {
  useEffect(() => {
    setupNetworkStatusListener();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: mmkvQueryPersister, maxAge: ONE_DAY_MS }}
        >
          <AppContent />
        </PersistQueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

// Split out so it can call useTheme() — that hook only works inside
// ThemeProvider, which wraps this component, not App() itself.
function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineBanner />
      <RootNavigator />
    </>
  );
}
