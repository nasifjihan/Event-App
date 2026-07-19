import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/theme/ThemeContext';
import AuthNavigator from '@/navigation/AuthNavigator';
import TabNavigator from '@/navigation/TabNavigator';

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark, colors } = useTheme();

  // React Navigation has its own theme concept (controls header/tab bar
  // background, default text color, etc.). We base it on their built-in
  // Default/Dark themes, then override with our own palette so it matches
  // the rest of the app exactly.
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
