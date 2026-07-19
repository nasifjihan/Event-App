import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  captureTravelAnalyticsSnapshot,
  fetchTravelAnalyticsSnapshots,
} from '@/api/travelApi';
import { useAuth } from '@/hooks/useAuth';

export function useTravelAnalyticsSnapshots() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['travel-analytics-snapshots', user?.id];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchTravelAnalyticsSnapshots(user!.id),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: () => captureTravelAnalyticsSnapshot(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    snapshots: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    captureSnapshot: mutation.mutateAsync,
    isCapturing: mutation.isPending,
  };
}
