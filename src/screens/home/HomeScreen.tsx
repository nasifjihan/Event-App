import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EventRow } from '@/types/event';
import { useEvents } from '@/hooks/useEvents';
import { useAllEventsForMap } from '@/hooks/useAllEventsForMap';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { distanceInKm, formatDistance } from '@/utils/distance';
import EventCard, { CARD_HEIGHT_WITH_MARGIN } from '@/components/events/EventCard';
import EmptyEventsState from '@/components/events/EmptyEventsState';
import EventsMap from '@/components/maps/EventsMap';
import { HomeStackParamList } from '@/navigation/HomeStackNavigator';
import { useTheme } from '@/theme/ThemeContext';

type ViewMode = 'list' | 'map';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { colors } = useTheme();
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const { coords: myCoords } = useCurrentLocation();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEvents(debouncedSearch);

  const { data: mapEvents, isLoading: isMapLoading } = useAllEventsForMap(viewMode === 'map');

  // Without useMemo here, typing in the search box (which updates
  // searchInput on every keystroke, well before the debounce fires)
  // would re-run flatMap over every loaded page on every single re-render
  // — pointless work since `data` itself hasn't changed. This is a case
  // where memoization pays for itself: cheap check, real avoided work.
  const allEvents: EventRow[] = useMemo(
    () => data?.pages.flatMap((page) => page.events) ?? [],
    [data]
  );

  const distanceLabelFor = useCallback(
    (event: EventRow): string | null => {
      if (!myCoords || event.latitude == null || event.longitude == null) return null;
      const km = distanceInKm(myCoords.latitude, myCoords.longitude, event.latitude, event.longitude);
      return formatDistance(km);
    },
    [myCoords]
  );

  const handleEventPress = useCallback(
    (event: EventRow) => {
      navigation.navigate('EventDetail', { event });
    },
    [navigation]
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const mapInitialRegion = useMemo(
    () => ({
      latitude: myCoords?.latitude ?? 37.7749,
      longitude: myCoords?.longitude ?? -122.4194,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }),
    [myCoords]
  );

  // Wrapping renderItem avoids creating a brand-new function on every
  // HomeScreen render. On its own this is a minor win (FlatList doesn't
  // require renderItem's identity to stay stable for correctness), but
  // it's cheap, idiomatic, and keeps the closure's dependencies explicit.
  const renderItem = useCallback(
    ({ item }: { item: EventRow }) => (
      <EventCard event={item} onPress={handleEventPress} distanceLabel={distanceLabelFor(item)} />
    ),
    [handleEventPress, distanceLabelFor]
  );

  // Because every card is EXACTLY CARD_HEIGHT_WITH_MARGIN tall (see
  // EventCard.tsx), we can tell FlatList each item's position with pure
  // math instead of it having to render and measure everything up to that
  // point first. This is what makes onEndReached / scroll-to-index /
  // "restore scroll position after returning to this screen" all cheap,
  // even with hundreds of items.
  const getItemLayout = useCallback(
    (_data: ArrayLike<EventRow> | null | undefined, index: number) => ({
      length: CARD_HEIGHT_WITH_MARGIN,
      offset: CARD_HEIGHT_WITH_MARGIN * index,
      index,
    }),
    []
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Events near you</Text>
          <View style={[styles.toggle, { backgroundColor: colors.border }]}>
            <Pressable
              style={[styles.toggleButton, viewMode === 'list' && { backgroundColor: colors.card }]}
              onPress={() => setViewMode('list')}
            >
              <Text style={[styles.toggleText, { color: viewMode === 'list' ? colors.text : colors.subtext }]}>
                List
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleButton, viewMode === 'map' && { backgroundColor: colors.card }]}
              onPress={() => setViewMode('map')}
            >
              <Text style={[styles.toggleText, { color: viewMode === 'map' ? colors.text : colors.subtext }]}>
                Map
              </Text>
            </Pressable>
          </View>
        </View>
        {viewMode === 'list' && (
          <TextInput
            style={[
              styles.searchInput,
              { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Search events..."
            placeholderTextColor={colors.subtext}
            value={searchInput}
            onChangeText={setSearchInput}
            autoCapitalize="none"
          />
        )}
      </View>

      {viewMode === 'map' ? (
        isMapLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" />
        ) : (
          <EventsMap
            events={mapEvents ?? []}
            initialRegion={mapInitialRegion}
            onEventPress={handleEventPress}
          />
        )
      ) : isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.danger }]}>
            Couldn't load events: {error?.message}
          </Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => refetch()}
          >
            <Text style={[styles.retryText, { color: colors.primaryText }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={allEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
          ListEmptyComponent={<EmptyEventsState searchQuery={debouncedSearch} />}
          onRefresh={refetch}
          refreshing={isRefetching}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={{ marginVertical: 16 }} />
            ) : null
          }
          // --- Virtualization tuning ---
          // These defaults are already reasonable for most lists; the point
          // isn't "bigger numbers = faster" but understanding each knob:
          //
          // initialNumToRender: how many items render on first mount.
          // Lower = faster initial paint, but a visible gap if the user
          // scrolls fast before more items render in.
          initialNumToRender={8}
          // maxToRenderPerBatch: how many NEW items render per batch as
          // the user scrolls. Lower = smoother scrolling (less work per
          // frame), higher = fewer visible "pop-in" gaps.
          maxToRenderPerBatch={8}
          // windowSize: how many screens' worth of content to keep
          // rendered above/below the visible area, in units of the visible
          // screen height. Default is 21 (10 above + 10 below + visible) —
          // way more than this list needs. Lower it and you use less
          // memory per screen, at the cost of a visible blank flash if the
          // user scrolls very fast (React has to catch up).
          windowSize={7}
          // removeClippedSubviews: unmounts views that are far off-screen
          // (Android especially benefits from this — fewer native views
          // alive at once). Safe here since every card is simple and has
          // no state that would be lost by unmounting.
          removeClippedSubviews
        />
      )}

      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('CreateEvent')}
      >
        <Text style={[styles.fabText, { color: colors.primaryText }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '700' },
  toggle: { flexDirection: 'row', borderRadius: 8, padding: 2 },
  toggleButton: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  toggleText: { fontSize: 13, fontWeight: '500' },
  searchInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  errorText: { textAlign: 'center', marginBottom: 12 },
  retryButton: { borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.2)',
  },
  fabText: { fontSize: 28, lineHeight: 30, fontWeight: '400' },
});
