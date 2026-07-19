import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFavoriteExperiences, toggleFavoriteExperience } from '@/api/travelApi';
import { useAuth } from '@/hooks/useAuth';

export function useFavoriteExperiences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['travel-favorites', user?.id];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchFavoriteExperiences(user!.id),
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: (experienceId: string) => toggleFavoriteExperience(user!.id, experienceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    favorites: query.data ?? [],
    favoriteIds: new Set((query.data ?? []).map((item) => item.id)),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    toggleFavorite: (experienceId: string) => toggleMutation.mutateAsync(experienceId),
    isToggling: toggleMutation.isPending,
  };
}
