# Local Events App — Phase 1: Setup, Navigation, Auth

This is your project skeleton. It's not a finished app yet — it's the foundation
we'll build every other feature on top of.

## What's in this phase

- Expo + TypeScript project structure
- Supabase connected for authentication
- Navigation: Login/Signup ↔ Bottom Tabs (Home, Profile, Settings)
- Working signup, login, and logout flow
- Empty placeholder screens for what comes next

## Setup steps

### 1. Create the Expo project locally

On your own machine (not in this chat), run:

```bash
npx create-expo-app local-events-app -t expo-template-blank-typescript
cd local-events-app
```

Then copy every file from this download into that folder, overwriting the
defaults (App.tsx, app.json, package.json, tsconfig.json) and adding the `src/`
and `supabase/` folders.

### 2. Install dependencies

```bash
npm install
```

### 3. Create your Supabase project

1. Go to https://supabase.com and create a free account + new project
2. Once it's ready, go to **Project Settings → API**
3. Copy the **Project URL** and **anon public key**

### 4. Set up your environment variables

```bash
cp .env.example .env
```

Paste your Supabase URL and anon key into `.env`.

### 5. Create the database table

1. In your Supabase dashboard, go to **SQL Editor → New Query**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

This creates the `events` and `event_attendees` tables we'll use starting Phase 3,
with Row Level Security already configured (so users can only edit their own events).

### 6. Enable email auth (usually on by default)

In Supabase: **Authentication → Providers → Email** should already be enabled.
For faster local testing, you can turn OFF "Confirm email" under
**Authentication → Settings** so signup logs you in immediately without checking email.

### 7. Run the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) or press `i` / `a` for a simulator.

## What to test

- Sign up with an email/password → you should land on the Home tab
- Log out from Profile → you should land back on Login
- Log back in with the same credentials → should work

## Next: Phase 2

Once this is running and auth works end-to-end, tell me and we'll build the
real Events list (FlatList, search, pull-to-refresh, infinite scroll) on the
Home screen using TanStack Query against your Supabase `events` table.

## Folder structure

```
src/
├── config/
│   └── supabase.ts       # Supabase client
├── hooks/
│   └── useAuth.ts        # tracks login/logout session state
├── navigation/
│   ├── RootNavigator.tsx # switches Auth vs Main app
│   ├── AuthNavigator.tsx # Login/Signup stack
│   └── TabNavigator.tsx  # Home/Profile/Settings tabs
└── screens/
    ├── auth/              # Login, Signup (done)
    ├── home/               # placeholder → Phase 3
    ├── profile/            # placeholder (logout works)
    └── settings/           # placeholder → Phase 9
```
