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
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_id uuid references public.destinations(id) on delete cascade,
  experience_id uuid references public.experiences(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, destination_id, experience_id)
);

alter table public.profiles enable row level security;
alter table public.destinations enable row level security;
alter table public.experiences enable row level security;
alter table public.trip_plans enable row level security;
alter table public.trip_plan_items enable row level security;
alter table public.bookings enable row level security;
alter table public.favorites enable row level security;

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

create policy "Users manage their own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
