import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ManageScreen from '@/screens/manage/ManageScreen';
import EditHostedExperienceScreen from '@/screens/manage/EditHostedExperienceScreen';
import { TravelExperience } from '@/types/travel';

export type ManageStackParamList = {
  ManageHome: undefined;
  EditHostedExperience: { experience: TravelExperience };
};

const Stack = createNativeStackNavigator<ManageStackParamList>();

export default function ManageStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ManageHome"
        component={ManageScreen}
        options={{ title: 'Manage', headerShown: false }}
      />
      <Stack.Screen
        name="EditHostedExperience"
        component={EditHostedExperienceScreen}
        options={{ title: 'Edit Experience', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
