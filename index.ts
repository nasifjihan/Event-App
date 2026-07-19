import { registerRootComponent } from 'expo';

import App from './App';

// #region debug-point A:index-entry
fetch('http://30.30.28.64:7777/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'expo-go-stuck',
    runId: 'pre-fix',
    hypothesisId: 'A',
    location: 'index.ts:5',
    msg: '[DEBUG] Root entry evaluated',
    data: {},
    ts: Date.now(),
  }),
}).catch(() => {});
// #endregion

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
