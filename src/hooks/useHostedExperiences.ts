import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchHostedExperiences,
  toggleHostedExperienceStatus,
} from '@/api/travelApi';
import { useAuth } from '@/hooks/useAuth';
import { TravelExperience } from '@/types/travel';

export function useHostedExperiences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['travel-hosted-experiences', user?.id];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchHostedExperiences(user!.id),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (experience: TravelExperience) => toggleHostedExperienceStatus(experience),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['travel-experiences'] });
    },
  });

  return {
    experiences: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    toggleStatus: (experience: TravelExperience) => mutation.mutateAsync(experience),
    isMutating: mutation.isPending,
  };
}
