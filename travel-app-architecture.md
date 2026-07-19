# Travel App Architecture

## Product Direction

This project now targets a travel experiences platform instead of a generic local events feed.
The short-term product shape is:

- destination discovery
- premium experience publishing
- traveler wishlists
- trip planning boards
- reservation-ready detail pages

## Frontend Structure

The app keeps the existing Expo + Supabase foundation and introduces a cleaner travel layer:

- `src/navigation/TravelStackNavigator.tsx`
  - travel-first stack for explore, detail, creation, and map pinning
- `src/features/travel/`
  - travel-specific types, curated content, and reusable UI sections
- `src/screens/explore/`
  - discovery and travel merchandising
- `src/screens/travel/`
  - experience detail and experience creation
- `src/screens/trips/`
  - itinerary and planning board surface
- `src/screens/saved/`
  - wishlist and research surface

## Backend Direction

The legacy `events` table still powers live discovery so the app remains functional immediately.
The next backend phase should move core product workflows to `supabase/travel_schema.sql`:

- `profiles`
- `destinations`
- `experiences`
- `trip_plans`
- `trip_plan_items`
- `bookings`
- `favorites`

## Delivery Phases

1. Rebrand the app and clean technical debt.
2. Introduce travel-first navigation and premium discovery screens.
3. Migrate from `events` to `experiences`, add provider operations, and surface reservation history.
4. Add real saved items, trip plans, and bookings.
5. Add server-side notifications, admin workflows, and analytics.

## Phase 3 Assets

- `supabase/travel_cutover_from_events.sql`
  - migrates legacy events and attendees into travel experiences and bookings
- `supabase/travel_seed.sql`
  - seeds featured destinations for the travel catalog
- `src/screens/manage/ManageScreen.tsx`
  - provider management surface for hosted inventory
- `src/hooks/useBookingHistory.ts`
  - traveler reservation history query

## Phase 4 Assets

- `src/navigation/TripsStackNavigator.tsx`
  - adds a real trip-plan creation workflow
- `src/navigation/ManageStackNavigator.tsx`
  - adds hosted experience editing flow from the provider dashboard
- `src/screens/travel/DestinationDetailScreen.tsx`
  - destination storytelling and merchandising screen
- `src/screens/trips/CreateTripPlanScreen.tsx`
  - create trip plans from the app UI
- `src/screens/manage/EditHostedExperienceScreen.tsx`
  - edit native travel experiences after cutover

## Phase 5 Assets

- `src/hooks/useProviderBookings.ts`
  - provider-side booking queue and status updates
- `src/hooks/useTravelOperationsSummary.ts`
  - operations metrics for inventory, bookings, and projected revenue
- `src/hooks/useNotificationPreferences.ts`
  - traveler/provider notification preferences
- `supabase/travel_schema.sql`
  - notification queue and booking-management policies
