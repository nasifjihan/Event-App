import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent, NewEventInput } from '@/api/eventsApi';

/**
 * On success, invalidates the ['events'] query — this tells TanStack Query
 * "the cached list is stale, refetch it." That's what makes the Home list
 * show the new event immediately without any manual refresh logic.
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewEventInput) => createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
