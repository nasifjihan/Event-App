import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchProviderBookings,
  updateProviderBookingStatus,
} from '@/api/travelApi';
import { useAuth } from '@/hooks/useAuth';

export function useProviderBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['travel-provider-bookings', user?.id];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchProviderBookings(user!.id),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (payload: { bookingId: string; bookingStatus: 'pending' | 'confirmed' | 'cancelled' }) =>
      updateProviderBookingStatus(payload.bookingId, payload.bookingStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['travel-operations-summary', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['travel-booking-history', user?.id] });
    },
  });

  return {
    bookings: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateStatus: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
