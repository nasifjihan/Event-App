# Debug Session: expo-go-stuck

Status: [OPEN]

## Symptom
- Expo Go stays at 99% building after Metro reports a successful Android bundle.

## Expected
- The app should move past the Expo Go loading screen and render the initial screen.

## Initial Hypotheses
- Hypothesis 1: The JS bundle loads, but the root component throws very early during app initialization.
- Hypothesis 2: The app is waiting forever on an initialization promise, such as storage, auth, or data bootstrap.
- Hypothesis 3: A navigation or provider setup introduced during the SDK upgrade is blocking the first commit.
- Hypothesis 4: A native module or Expo module now behaves differently in Expo Go and stalls startup before the first screen.
- Hypothesis 5: The app renders, but a full-screen loading state never exits because initial state is never resolved.

## Evidence Log
- No runtime events received yet in `.dbg/trae-debug-log-expo-go-stuck.ndjson`.
- User opened `http://localhost:8081` in a browser and saw Expo manifest JSON instead of app UI.
- This indicates the native dev server is running, but the instrumented native app path in Expo Go has not yet been observed by the collector.
- Web reproduction produced a concrete runtime error from Supabase client creation: `supabaseUrl is required`.
- `.env` exists but is empty.
- `src/config/supabase.ts` reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`, so empty env values cause the client to throw during module initialization.

## Next Step
- Ask the user whether to populate `.env` and rerun, or patch the app to fail gracefully when env vars are missing.
