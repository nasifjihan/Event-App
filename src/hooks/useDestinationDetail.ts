import { useQuery } from '@tanstack/react-query';
import { fetchDestinationById } from '@/api/travelApi';

export function useDestinationDetail(destinationId: string) {
  return useQuery({
    queryKey: ['travel-destination', destinationId],
    queryFn: () => fetchDestinationById(destinationId),
    enabled: !!destinationId,
  });
}
