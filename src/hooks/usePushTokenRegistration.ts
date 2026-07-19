import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/hooks/useAuth';
import { upsertExpoPushToken } from '@/api/travelApi';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2D6CDF',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId =
    Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId ?? undefined;

  const token = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  return token.data;
}

export function usePushTokenRegistration() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }

    let isCancelled = false;

    const syncPushToken = async () => {
      try {
        const expoPushToken = await registerForPushNotificationsAsync();

        if (!expoPushToken || isCancelled) {
          return;
        }

        await upsertExpoPushToken(user.id, expoPushToken);
      } catch (error) {
        console.warn('[Notifications] Push token registration skipped.', error);
      }
    };

    void syncPushToken();

    return () => {
      isCancelled = true;
    };
  }, [user]);
}
