export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  primaryText: string; // text/icon color to use on top of a primary-colored surface
  inputBackground: string;
  danger: string;
}

export const lightColors: ThemeColors = {
  background: '#f6f6f7',
  card: '#ffffff',
  text: '#111111',
  subtext: '#666666',
  border: '#e5e5e5',
  primary: '#111111',
  primaryText: '#ffffff',
  inputBackground: '#ffffff',
  danger: '#e53e3e',
};

export const darkColors: ThemeColors = {
  background: '#0d0d0f',
  card: '#1c1c1e',
  text: '#f5f5f5',
  subtext: '#a0a0a5',
  border: '#2c2c2e',
  primary: '#ffffff',
  primaryText: '#111111',
  inputBackground: '#1c1c1e',
  danger: '#ff6b6b',
};
