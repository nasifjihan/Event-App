import { useQuery } from '@tanstack/react-query';
import { fetchBookingHistory } from '@/api/travelApi';
import { useAuth } from '@/hooks/useAuth';

export function useBookingHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['travel-booking-history', user?.id],
    queryFn: () => fetchBookingHistory(user!.id),
    enabled: !!user,
  });
}
