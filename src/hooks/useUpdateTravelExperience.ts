import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTravelExperience, UpsertTravelExperienceInput } from '@/api/travelApi';

export function useUpdateTravelExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertTravelExperienceInput) => updateTravelExperience(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-hosted-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['travel-experiences'] });
    },
  });
}
