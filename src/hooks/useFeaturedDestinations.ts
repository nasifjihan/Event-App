import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedDestinations } from '@/api/travelApi';

export function useFeaturedDestinations() {
  return useQuery({
    queryKey: ['travel-destinations', 'featured'],
    queryFn: fetchFeaturedDestinations,
  });
}
