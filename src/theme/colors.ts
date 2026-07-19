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
  background: '#f4f7fb',
  card: '#ffffff',
  text: '#142033',
  subtext: '#60708a',
  border: '#d8e1ee',
  primary: '#142033',
  primaryText: '#ffffff',
  inputBackground: '#ffffff',
  danger: '#d84848',
};

export const darkColors: ThemeColors = {
  background: '#08111c',
  card: '#111c2b',
  text: '#f4f8ff',
  subtext: '#9fb0c7',
  border: '#223149',
  primary: '#f4f8ff',
  primaryText: '#08111c',
  inputBackground: '#111c2b',
  danger: '#ff7575',
};
