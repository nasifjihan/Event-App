# [OPEN] web-maps-codegen

## Symptom
- Web runtime crashes with `codegenNativeComponent is not a function`.
- Stack points into `react-native-maps` while loading `HomeScreen`.

## Falsifiable Hypotheses
1. `HomeScreen` imports `react-native-maps` unconditionally on web, so the web bundle executes native-only codegen entrypoints.
2. The installed `react-native-maps` version is compatible with native but not with the current Expo SDK 57 web runtime.
3. A project-level alias or transpilation setting causes the web build to resolve a native spec file instead of a web-safe entry.
4. Hot reload is surfacing a stale module graph, and a clean web bundle would stop resolving the offending native component.
5. Another map-related wrapper file re-exports `react-native-maps` before any platform guard, so the crash occurs before screen rendering logic can branch.

## Evidence Log
- Pending instrumentation and reproduction.

## Next Step
- Inspect map imports and add minimal runtime instrumentation around the first web map import path.
