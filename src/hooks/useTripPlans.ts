import { useQuery } from '@tanstack/react-query';
import { fetchTripPlans } from '@/api/travelApi';
import { useAuth } from '@/hooks/useAuth';

export function useTripPlans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['travel-trip-plans', user?.id],
    queryFn: () => fetchTripPlans(user!.id),
    enabled: !!user,
  });
}
