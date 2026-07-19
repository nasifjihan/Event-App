import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';
import dayjs from 'dayjs';
import { EventRow } from '@/types/event';

// Controls how notifications behave while the app is open in the foreground.
// Without this handler, foreground notifications are silently swallowed on iOS.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_LEAD_TIME_MINUTES = 60;

/**
 * Deterministic notification identifier based on the event id. This means
 * we never have to store "which notification belongs to which event"
 * ourselves — we can always recompute the id and cancel by it directly.
 */
function reminderIdentifier(eventId: string): string {
  return `event-reminder-${eventId}`;
}

/**
 * Requests notification permission. Safe to call repeatedly — if already
 * granted, this resolves immediately without prompting the user again.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    // Android 8+ requires a notification channel before scheduling anything.
    await Notifications.setNotificationChannelAsync('event-reminders', {
      name: 'Event reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedules a local notification 1 hour before the event starts.
 * Called right after a successful "join" — if the user isn't granted
 * permission, this quietly no-ops rather than blocking the join action.
 */
export async function scheduleEventReminder(event: EventRow): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const reminderTime = dayjs(event.starts_at).subtract(REMINDER_LEAD_TIME_MINUTES, 'minute');

  // Don't schedule reminders that would fire in the past — this happens
  // if the user joins an event that's already starting within the hour.
  if (reminderTime.isBefore(dayjs())) return;

  await Notifications.scheduleNotificationAsync({
    identifier: reminderIdentifier(event.id),
    content: {
      title: event.title,
      body: `Starts in ${REMINDER_LEAD_TIME_MINUTES} minutes${
        event.location_name ? ` at ${event.location_name}` : ''
      }`,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: reminderTime.toDate(),
    },
  });
}

/** Cancels the reminder for an event — called when the user leaves it. */
export async function cancelEventReminder(eventId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(reminderIdentifier(eventId));
}

/**
 * Fires an immediate local notification (trigger: null = right now).
 * Used by the "Send test notification" button on Settings so the user can
 * confirm permissions and delivery are working without waiting an hour.
 */
export async function sendTestNotification(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '👋 Test notification',
      body: 'If you can see this, local notifications are working.',
    },
    trigger: null,
  });
}
