import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchModerationQueue, updateModerationItem } from '@/api/travelApi';
import { TravelModerationItem } from '@/types/travel';

export function useModerationQueue() {
  const queryClient = useQueryClient();
  const queryKey = ['travel-moderation-queue'];

  const query = useQuery({
    queryKey,
    queryFn: fetchModerationQueue,
  });

  const mutation = useMutation({
    mutationFn: (payload: {
      item: Pick<TravelModerationItem, 'id' | 'entityType'>;
      decision: 'approved' | 'rejected';
    }) => updateModerationItem(payload.item, payload.decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['travel-hosted-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['travel-experiences'] });
    },
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateItem: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
