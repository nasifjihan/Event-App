-- Run this in your Supabase project: SQL Editor > New Query > paste > Run
-- This creates the events table we'll use starting in Phase 3.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  cover_image_url text,
  location_name text,
  latitude double precision,
  longitude double precision,
  starts_at timestamptz not null,
  created_at timestamptz default now()
);

-- Row Level Security: only logged-in users can read events,
-- only the host can update/delete their own events.
alter table public.events enable row level security;

create policy "Events are viewable by everyone who is logged in"
  on public.events for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own events"
  on public.events for insert
  with check (auth.uid() = host_id);

create policy "Users can update their own events"
  on public.events for update
  using (auth.uid() = host_id);

create policy "Users can delete their own events"
  on public.events for delete
  using (auth.uid() = host_id);

-- Table for who joined which event (used in Phase 6)
create table if not exists public.event_attendees (
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (event_id, user_id)
);

alter table public.event_attendees enable row level security;

create policy "Attendees are viewable by everyone who is logged in"
  on public.event_attendees for select
  using (auth.role() = 'authenticated');

create policy "Users can join events as themselves"
  on public.event_attendees for insert
  with check (auth.uid() = user_id);

create policy "Users can leave events they joined"
  on public.event_attendees for delete
  using (auth.uid() = user_id);
