import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchProviderProfile,
  submitProviderOnboarding,
  SubmitProviderOnboardingInput,
} from '@/api/travelApi';
import { useAuth } from '@/hooks/useAuth';

export function useProviderProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['travel-provider-profile', user?.id];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchProviderProfile(user!.id),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (input: Omit<SubmitProviderOnboardingInput, 'userId'>) =>
      submitProviderOnboarding({
        userId: user!.id,
        ...input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['travel-moderation-queue'] });
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    submitOnboarding: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
  };
}
