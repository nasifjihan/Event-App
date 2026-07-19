import { supabase } from '@/config/supabase';

export interface AttendanceStatus {
  count: number;
  isAttending: boolean;
}

/**
 * Fetches both the total attendee count and whether the current user is
 * among them, in parallel — two lightweight queries rather than one
 * heavier one, since Supabase counts are cheap with `head: true`.
 */
export async function fetchAttendanceStatus(
  eventId: string,
  userId: string
): Promise<AttendanceStatus> {
  const [countResult, mineResult] = await Promise.all([
    supabase
      .from('event_attendees')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId),
    supabase
      .from('event_attendees')
      .select('user_id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  if (countResult.error) throw new Error(countResult.error.message);
  if (mineResult.error) throw new Error(mineResult.error.message);

  return {
    count: countResult.count ?? 0,
    isAttending: !!mineResult.data,
  };
}

export async function joinEvent(eventId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('event_attendees')
    .insert({ event_id: eventId, user_id: userId });
  if (error) throw new Error(error.message);
}

export async function leaveEvent(eventId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('event_attendees')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}
