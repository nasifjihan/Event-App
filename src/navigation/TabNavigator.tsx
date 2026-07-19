import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TravelStackNavigator from '@/navigation/TravelStackNavigator';
import TripsScreen from '@/screens/trips/TripsScreen';
import SavedScreen from '@/screens/saved/SavedScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import { useTheme } from '@/theme/ThemeContext';

export type TabParamList = {
  Explore: undefined;
  Trips: undefined;
  Saved: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.subtext,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Explore" component={TravelStackNavigator} />
      <Tab.Screen name="Trips" component={TripsScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
