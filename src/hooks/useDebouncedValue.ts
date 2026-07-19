import { useEffect, useState } from 'react';

/**
 * Delays updating `value` until the user stops typing for `delayMs`.
 * Without this, every keystroke in the search bar would fire a new
 * Supabase query — wasteful and makes the list flicker.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
