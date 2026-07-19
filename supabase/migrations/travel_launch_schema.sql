create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  home_city text,
  bio text,
  travel_style text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  country text not null,
  summary text,
  hero_image_url text,
  latitude double precision,
  longitude double precision,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users(id) on delete cascade,
  legacy_event_id uuid unique references public.events(id) on delete set null,
  destination_id uuid references public.destinations(id) on delete set null,
  title text not null,
  slug text unique not null,
  summary text,
  body text,
  cover_image_url text,
  meeting_point text,
  price_amount numeric(10, 2),
  currency text default 'USD',
  starts_at timestamptz,
  duration_minutes integer,
  capacity integer,
  source_kind text not null default 'native',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  start_date date,
  end_date date,
  status text not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_plan_items (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid not null references public.trip_plans(id) on delete cascade,
  experience_id uuid references public.experiences(id) on delete set null,
  day_number integer not null default 1,
  starts_at timestamptz,
  title text not null,
  notes text,
  sort_order integer not null default 0
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  booking_status text not null default 'pending',
  travelers_count integer not null default 1,
  total_amount numeric(10, 2),
  currency text default 'USD',
  booked_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_id uuid references public.destinations(id) on delete cascade,
  experience_id uuid references public.experiences(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (
    ((destination_id is not null)::int + (experience_id is not null)::int) = 1
  )
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  booking_confirmations boolean not null default true,
  trip_reminders boolean not null default true,
  promotions boolean not null default false,
  provider_alerts boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  title text not null,
  body text not null,
  related_booking_id uuid references public.bookings(id) on delete set null,
  related_experience_id uuid references public.experiences(id) on delete set null,
  delivery_channel text not null default 'in_app',
  delivery_status text not null default 'queued',
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.provider_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  business_name text,
  contact_email text,
  portfolio_url text,
  notes text,
  approval_status text not null default 'pending',
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  live_experiences integer not null default 0,
  pending_bookings integer not null default 0,
  confirmed_bookings integer not null default 0,
  projected_revenue numeric(10, 2) not null default 0,
  currency text not null default 'USD',
  captured_at timestamptz not null default now()
);

create table if not exists public.notification_dispatch_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  processed_count integer not null default 0,
  success_count integer not null default 0,
  failure_count integer not null default 0,
  status text not null default 'queued',
  notes text
);

create unique index if not exists favorites_user_destination_unique
  on public.favorites (user_id, destination_id)
  where destination_id is not null;

create unique index if not exists favorites_user_experience_unique
  on public.favorites (user_id, experience_id)
  where experience_id is not null;

alter table public.profiles enable row level security;
alter table public.destinations enable row level security;
alter table public.experiences enable row level security;
alter table public.trip_plans enable row level security;
alter table public.trip_plan_items enable row level security;
alter table public.bookings enable row level security;
alter table public.favorites enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_queue enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.analytics_snapshots enable row level security;
alter table public.notification_dispatch_runs enable row level security;

create policy "Profiles are readable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users manage their own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Destinations are readable by authenticated users"
  on public.destinations for select
  using (auth.role() = 'authenticated');

create policy "Hosts manage experiences they own"
  on public.experiences for all
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "Authenticated users can read live experiences"
  on public.experiences for select
  using (auth.role() = 'authenticated' and status in ('published', 'live'));

create policy "Admins read all experiences"
  on public.experiences for select
  using ((auth.jwt() -> 'app_metadata' ->> 'travel_role') = 'admin');

create policy "Admins update all experiences"
  on public.experiences for update
  using ((auth.jwt() -> 'app_metadata' ->> 'travel_role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'travel_role') = 'admin');

create policy "Users manage their own trip plans"
  on public.trip_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage items inside their own trip plans"
  on public.trip_plan_items for all
  using (
    exists (
      select 1
      from public.trip_plans tp
      where tp.id = trip_plan_items.trip_plan_id
        and tp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.trip_plans tp
      where tp.id = trip_plan_items.trip_plan_id
        and tp.user_id = auth.uid()
    )
  );

create policy "Users manage their own bookings"
  on public.bookings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Hosts read bookings for their experiences"
  on public.bookings for select
  using (
    exists (
      select 1
      from public.experiences e
      where e.id = bookings.experience_id
        and e.host_id = auth.uid()
    )
  );

create policy "Hosts update bookings for their experiences"
  on public.bookings for update
  using (
    exists (
      select 1
      from public.experiences e
      where e.id = bookings.experience_id
        and e.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.experiences e
      where e.id = bookings.experience_id
        and e.host_id = auth.uid()
    )
  );

create policy "Users manage their own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their notification preferences"
  on public.notification_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users read their own notification queue"
  on public.notification_queue for select
  using (auth.uid() = user_id);

create policy "Users manage their own provider profile"
  on public.provider_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins read provider profiles"
  on public.provider_profiles for select
  using ((auth.jwt() -> 'app_metadata' ->> 'travel_role') = 'admin');

create policy "Admins update provider profiles"
  on public.provider_profiles for update
  using ((auth.jwt() -> 'app_metadata' ->> 'travel_role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'travel_role') = 'admin');

create policy "Owners read their analytics snapshots"
  on public.analytics_snapshots for select
  using (auth.uid() = owner_user_id);

create policy "Owners insert their analytics snapshots"
  on public.analytics_snapshots for insert
  with check (auth.uid() = owner_user_id);

create policy "Admins read all analytics snapshots"
  on public.analytics_snapshots for select
  using ((auth.jwt() -> 'app_metadata' ->> 'travel_role') = 'admin');

create policy "Admins manage dispatch runs"
  on public.notification_dispatch_runs for all
  using ((auth.jwt() -> 'app_metadata' ->> 'travel_role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'travel_role') = 'admin');
