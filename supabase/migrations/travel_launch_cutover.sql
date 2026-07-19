insert into public.profiles (id, full_name, created_at, updated_at)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
  now(),
  now()
from auth.users u
on conflict (id) do update
set
  full_name = coalesce(public.profiles.full_name, excluded.full_name),
  updated_at = now();

insert into public.destinations (slug, title, country, summary, is_featured, created_at)
select distinct
  lower(regexp_replace(coalesce(e.location_name, 'destination-' || e.id::text), '[^a-zA-Z0-9]+', '-', 'g')) as slug,
  coalesce(e.location_name, 'Untitled Destination') as title,
  'Unknown' as country,
  'Migrated from legacy events during the travel platform cutover.' as summary,
  false as is_featured,
  now()
from public.events e
where e.location_name is not null
on conflict (slug) do nothing;

insert into public.experiences (
  legacy_event_id,
  host_id,
  destination_id,
  title,
  slug,
  summary,
  body,
  cover_image_url,
  meeting_point,
  starts_at,
  source_kind,
  status,
  created_at,
  updated_at
)
select
  e.id as legacy_event_id,
  e.host_id,
  d.id as destination_id,
  e.title,
  lower(regexp_replace(e.title || '-' || substring(e.id::text from 1 for 8), '[^a-zA-Z0-9]+', '-', 'g')) as slug,
  e.description,
  e.description,
  e.cover_image_url,
  e.location_name,
  e.starts_at,
  'legacy_event' as source_kind,
  'live' as status,
  e.created_at,
  now()
from public.events e
left join public.destinations d
  on d.title = e.location_name
where not exists (
  select 1
  from public.experiences ex
  where ex.legacy_event_id = e.id
);

insert into public.bookings (
  user_id,
  experience_id,
  booking_status,
  travelers_count,
  total_amount,
  currency,
  booked_at
)
select
  a.user_id,
  ex.id as experience_id,
  'confirmed' as booking_status,
  1 as travelers_count,
  null as total_amount,
  'USD' as currency,
  a.joined_at as booked_at
from public.event_attendees a
join public.experiences ex
  on ex.legacy_event_id = a.event_id
where not exists (
  select 1
  from public.bookings b
  where b.user_id = a.user_id
    and b.experience_id = ex.id
);
