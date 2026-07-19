import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTripPlan, CreateTripPlanInput } from '@/api/travelApi';

export function useCreateTripPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTripPlanInput) => createTripPlan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-trip-plans'] });
    },
  });
}
