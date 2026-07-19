# Manual QA Runbook

## Test Setup

- Use a seeded Supabase environment with launch migrations applied and `notification-dispatch` deployed.
- Prepare four accounts: traveler, pending provider, approved provider, and admin.
- Use a physical Android or iOS device for push-token and notification validation.
- Populate `.env` from `.env.example` with valid Supabase values before testing.
- Add `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` only if you plan to validate Android native map screens.

## Traveler Flow

- Sign in as a traveler and confirm the Explore tab renders featured destinations and experience cards.
- Open a destination detail screen and verify hero media, storytelling copy, and call-to-action sections load without layout issues.
- Save an experience or destination, then confirm it appears in the Saved tab after a refresh.
- Create or edit a trip plan and verify the Trips tab shows the correct planning status.
- Complete a booking or reservation flow and confirm the reservation history reflects the latest state.

## Provider Flow

- Sign in as a new provider and submit onboarding with business details and supporting content.
- Confirm the Manage stack shows the onboarding state as pending review until admin action is taken.
- Sign in as an approved provider and create or edit an experience with images, pricing, and location details.
- Review provider booking operations and verify booking status updates persist in the dashboard.

## Admin Flow

- Sign in as an admin and open the moderation center.
- Approve or reject provider onboarding and confirm the provider-facing status updates correctly.
- Review at least one `pending_review` experience and confirm approval changes it to `live`.
- Verify analytics and moderation summary surfaces render without missing-state regressions.

## Notification Flow

- Sign in on a physical device and confirm `profiles.expo_push_token` is populated for the active user.
- Trigger a booking or moderation action that queues a notification, or insert a QA row into `notification_queue`.
- Invoke the `notification-dispatch` Edge Function and verify the queue row changes to `sent` or a meaningful `failed` state.
- Confirm a push notification is received on-device and that `notification_dispatch_runs` records the dispatch outcome.

## Exit Criteria

- No blocking errors appear in `npm run check`, `npm run test`, or `npm run launch:check`.
- All traveler, provider, admin, and notification checks pass on the current preview build.
- Any failed checklist item is logged with reproduction notes before promoting the build.
