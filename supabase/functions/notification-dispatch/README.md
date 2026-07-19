# Notification Dispatch

Deploy this Supabase Edge Function after applying the launch schema.

## Deploy

```bash
supabase functions deploy notification-dispatch
```

## Required Secrets

```bash
supabase secrets set SUPABASE_URL=YOUR_PROJECT_URL
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
supabase secrets set EXPO_ACCESS_TOKEN=YOUR_OPTIONAL_EXPO_ACCESS_TOKEN
supabase secrets set NOTIFICATION_BATCH_SIZE=50
```

## Invoke

```bash
supabase functions invoke notification-dispatch
```

## Behavior

- Reads `notification_queue` rows with `delivery_status='queued'`
- Sends `expo_push` notifications through the Expo Push API when `profiles.expo_push_token` exists
- Marks `in_app` notifications as sent without external delivery
- Writes execution summaries to `notification_dispatch_runs`
