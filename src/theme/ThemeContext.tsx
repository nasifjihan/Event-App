import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { getItem, setItem } from '@/services/mmkvStorage';
import { lightColors, darkColors, ThemeColors } from '@/theme/colors';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  colors: ThemeColors;
}

const THEME_STORAGE_KEY = 'theme-mode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The device's actual system setting — only used when mode === 'system'.
  const systemScheme = useColorScheme();

  // Read the saved preference synchronously on first render (MMKV is sync,
  // so there's no flash of the wrong theme while loading).
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = getItem(THEME_STORAGE_KEY);
    return (saved as ThemeMode | null) ?? 'system';
  });

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    setItem(THEME_STORAGE_KEY, newMode);
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({ mode, setMode, isDark, colors }),
    [mode, isDark, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
