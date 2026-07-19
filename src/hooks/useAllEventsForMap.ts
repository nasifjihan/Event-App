import { useQuery } from '@tanstack/react-query';
import { fetchAllEventsForMap } from '@/api/eventsApi';

/**
 * `enabled` lets us skip this fetch entirely while the user is in list mode —
 * no point loading 200 events for a map nobody's looking at.
 */
export function useAllEventsForMap(enabled: boolean) {
  return useQuery({
    queryKey: ['events', 'map'],
    queryFn: fetchAllEventsForMap,
    enabled,
  });
}
