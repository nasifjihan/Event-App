import { useQuery } from '@tanstack/react-query';
import { fetchTravelOperationsSummary } from '@/api/travelApi';
import { useAuth } from '@/hooks/useAuth';

export function useTravelOperationsSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['travel-operations-summary', user?.id],
    queryFn: () => fetchTravelOperationsSummary(user!.id),
    enabled: !!user,
  });
}
