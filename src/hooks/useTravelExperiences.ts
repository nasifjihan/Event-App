import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchTravelExperiencesPage } from '@/api/travelApi';

export function useTravelExperiences(searchQuery: string) {
  return useInfiniteQuery({
    queryKey: ['travel-experiences', searchQuery],
    queryFn: ({ pageParam }) => fetchTravelExperiencesPage(pageParam, searchQuery),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
