import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ManageScreen from '@/screens/manage/ManageScreen';
import EditHostedExperienceScreen from '@/screens/manage/EditHostedExperienceScreen';
import { TravelExperience } from '@/types/travel';
import ProviderOnboardingScreen from '@/screens/manage/ProviderOnboardingScreen';
import ModerationCenterScreen from '@/screens/manage/ModerationCenterScreen';

export type ManageStackParamList = {
  ManageHome: undefined;
  EditHostedExperience: { experience: TravelExperience };
  ProviderOnboarding: undefined;
  ModerationCenter: undefined;
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
      <Stack.Screen
        name="ProviderOnboarding"
        component={ProviderOnboardingScreen}
        options={{ title: 'Provider Onboarding', presentation: 'modal' }}
      />
      <Stack.Screen
        name="ModerationCenter"
        component={ModerationCenterScreen}
        options={{ title: 'Moderation Center' }}
      />
    </Stack.Navigator>
  );
}
