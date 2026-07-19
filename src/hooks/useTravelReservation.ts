import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchExperienceReservationStatus,
  toggleExperienceReservation,
} from '@/api/travelApi';
import { useAuth } from '@/hooks/useAuth';
import { TravelExperience } from '@/types/travel';

export function useTravelReservation(experience: TravelExperience) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['travel-reservation', experience.id, user?.id];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchExperienceReservationStatus(user!.id, experience),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: () => toggleExperienceReservation(user!.id, experience),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    count: query.data?.count ?? 0,
    isReserved: query.data?.isReserved ?? false,
    isLoading: query.isLoading,
    toggle: () => mutation.mutateAsync(),
    isToggling: mutation.isPending,
  };
}
