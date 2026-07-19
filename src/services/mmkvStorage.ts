import { MMKV } from 'react-native-mmkv';

// One shared MMKV instance for the whole app. MMKV is synchronous (unlike
// AsyncStorage), which is what makes it fast enough to use as a query cache
// persister without adding noticeable startup delay — reads/writes happen
// in native code, not over a bridge round-trip.
export const mmkv = new MMKV({ id: 'local-events-app' });

export function getItem(key: string): string | null {
  const value = mmkv.getString(key);
  return value === undefined ? null : value;
}

export function setItem(key: string, value: string): void {
  mmkv.set(key, value);
}

export function removeItem(key: string): void {
  mmkv.delete(key);
}
