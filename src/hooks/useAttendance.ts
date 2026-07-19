import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAttendanceStatus,
  joinEvent,
  leaveEvent,
  AttendanceStatus,
} from '@/api/attendeesApi';
import { useAuth } from '@/hooks/useAuth';
import { scheduleEventReminder, cancelEventReminder } from '@/services/notifications';
import { EventRow } from '@/types/event';

export function useAttendance(event: EventRow) {
  const eventId = event.id;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['attendance', eventId, user?.id];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchAttendanceStatus(eventId, user!.id),
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not logged in');

      if (query.data?.isAttending) {
        await leaveEvent(eventId, user.id);
        await cancelEventReminder(eventId);
      } else {
        await joinEvent(eventId, user.id);
        // Scheduling happens after the DB write succeeds, so a failed join
        // never leaves an orphaned reminder scheduled on the device.
        await scheduleEventReminder(event);
      }
    },

    // Optimistic update: flip the button and count immediately, before the
    // server confirms, so the tap feels instant. `onMutate` runs first and
    // returns the previous value so we can roll back if the request fails.
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<AttendanceStatus>(queryKey);

      if (previous) {
        const next: AttendanceStatus = previous.isAttending
          ? { count: Math.max(0, previous.count - 1), isAttending: false }
          : { count: previous.count + 1, isAttending: true };
        queryClient.setQueryData(queryKey, next);
      }

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    // Whether it succeeded or failed, re-sync with the server afterward
    // to guarantee we're not left showing stale optimistic data.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    count: query.data?.count ?? 0,
    isAttending: query.data?.isAttending ?? false,
    isLoading: query.isLoading,
    toggle: () => toggleMutation.mutate(),
    isToggling: toggleMutation.isPending,
  };
}
