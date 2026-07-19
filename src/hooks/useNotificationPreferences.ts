import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '@/api/travelApi';
import { useAuth } from '@/hooks/useAuth';
import { TravelNotificationPreferences } from '@/types/travel';

export function useNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['travel-notification-preferences', user?.id];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchNotificationPreferences(user!.id),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (preferences: TravelNotificationPreferences) =>
      updateNotificationPreferences(user!.id, preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updatePreferences: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
