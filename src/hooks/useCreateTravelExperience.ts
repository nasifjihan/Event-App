import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTravelExperience } from '@/api/travelApi';
import { NewEventInput } from '@/api/eventsApi';

export function useCreateTravelExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewEventInput) => createTravelExperience(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
