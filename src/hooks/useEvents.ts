import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchEventsPage } from '@/api/eventsApi';

/**
 * Powers the Home screen list: infinite scroll + search, backed by
 * TanStack Query's cache (so switching tabs and coming back doesn't
 * refetch unless the data is stale).
 */
export function useEvents(searchQuery: string) {
  return useInfiniteQuery({
    queryKey: ['events', searchQuery], // changing search starts a fresh query + cache entry
    queryFn: ({ pageParam }) => fetchEventsPage(pageParam, searchQuery),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
