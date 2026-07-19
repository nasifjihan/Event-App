# Release Readiness

## Build Profiles

- `development`
  - internal development client build
- `preview`
  - internal QA / stakeholder build
- `production`
  - release build with auto-increment enabled

## Required Setup

- Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Replace `YOUR_ANDROID_GOOGLE_MAPS_API_KEY` in `app.json`
- Apply:
  - `supabase/travel_schema.sql`
  - `supabase/travel_seed.sql`
  - `supabase/travel_cutover_from_events.sql`
- Grant admin users `travel_role=admin` in Supabase auth app metadata for moderation and dispatch workflows

## Verification

- Run `npm run typecheck`
- Run `npm run doctor`
- Test `expo start --web`
- Test provider onboarding, moderation, booking updates, and reservation history on a seeded account
- Validate notification preference updates and queued notification records

## Notification Delivery

- `notification_queue` stores user-facing notification jobs
- `notification_dispatch_runs` stores execution metadata for a future Edge Function or worker
- Recommended production worker loop:
  - read queued notifications due now
  - send Expo push / in-app delivery
  - mark `delivery_status`
  - record aggregate run details in `notification_dispatch_runs`

## Moderation Flow

- Providers submit onboarding from the app
- Admins review onboarding and pending experiences in the moderation center
- New native experiences default to `pending_review`
- Approved experiences move to `live`; rejected experiences move to `draft`
