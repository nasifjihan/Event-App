import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExploreScreen from '@/screens/explore/ExploreScreen';
import CreateExperienceScreen from '@/screens/travel/CreateExperienceScreen';
import PickExperienceLocationScreen from '@/screens/travel/PickExperienceLocationScreen';
import ExperienceDetailScreen from '@/screens/travel/ExperienceDetailScreen';
import DestinationDetailScreen from '@/screens/travel/DestinationDetailScreen';
import { TravelExperience } from '@/types/travel';

export interface PickedLocation {
  latitude: number;
  longitude: number;
  locationName: string;
}

export type TravelStackParamList = {
  ExploreHome: undefined;
  CreateExperience: { pickedLocation?: PickedLocation } | undefined;
  PickExperienceLocation: undefined;
  ExperienceDetail: { event: TravelExperience };
  DestinationDetail: { destinationId: string };
};

const Stack = createNativeStackNavigator<TravelStackParamList>();

export default function TravelStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ExploreHome"
        component={ExploreScreen}
        options={{ title: 'Explore', headerShown: false }}
      />
      <Stack.Screen
        name="CreateExperience"
        component={CreateExperienceScreen}
        options={{ title: 'Create Experience', presentation: 'modal' }}
      />
      <Stack.Screen
        name="PickExperienceLocation"
        component={PickExperienceLocationScreen}
        options={{ title: 'Pick Destination', presentation: 'modal' }}
      />
      <Stack.Screen
        name="ExperienceDetail"
        component={ExperienceDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DestinationDetail"
        component={DestinationDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
