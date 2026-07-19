import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/home/HomeScreen';
import CreateEventScreen from '@/screens/events/CreateEventScreen';
import PickLocationScreen from '@/screens/events/PickLocationScreen';
import EventDetailScreen from '@/screens/events/EventDetailScreen';
import { EventRow } from '@/types/event';

export interface PickedLocation {
  latitude: number;
  longitude: number;
  locationName: string;
}

export type HomeStackParamList = {
  EventsList: undefined;
  CreateEvent: { pickedLocation?: PickedLocation } | undefined;
  PickLocation: undefined;
  EventDetail: { event: EventRow };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

// This is the "tab containing its own stack" pattern: the Home tab isn't
// just one screen — it's a whole flow (list -> create -> pick location -> back)
// while Profile and Settings stay single screens.
export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="EventsList" component={HomeScreen} options={{ title: 'Events near you', headerShown: false }} />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ title: 'New Event', presentation: 'modal' }}
      />
      <Stack.Screen
        name="PickLocation"
        component={PickLocationScreen}
        options={{ title: 'Set Location', presentation: 'modal' }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
