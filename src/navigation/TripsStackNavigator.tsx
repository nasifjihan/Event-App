import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TripsScreen from '@/screens/trips/TripsScreen';
import CreateTripPlanScreen from '@/screens/trips/CreateTripPlanScreen';

export type TripsStackParamList = {
  TripsHome: undefined;
  CreateTripPlan: { prefillTitle?: string; prefillNotes?: string } | undefined;
};

const Stack = createNativeStackNavigator<TripsStackParamList>();

export default function TripsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TripsHome"
        component={TripsScreen}
        options={{ title: 'Trips', headerShown: false }}
      />
      <Stack.Screen
        name="CreateTripPlan"
        component={CreateTripPlanScreen}
        options={{ title: 'Create Trip Plan', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
