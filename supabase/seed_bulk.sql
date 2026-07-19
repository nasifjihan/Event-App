-- Run this in Supabase SQL Editor to generate 150 test events.
-- Replace YOUR_USER_ID the same way as in seed.sql.
--
-- Why this matters: with only 5-10 events, virtually any FlatList
-- configuration "works" — the perceived smoothness gap between a naive
-- list and a tuned one only shows up once you have enough items that the
-- device can't just render everything at once. This is what makes Phase 10
-- actually testable.

insert into public.events (host_id, title, description, cover_image_url, location_name, latitude, longitude, starts_at)
select
  'Nasif28',
  'Event #' || i || ': ' || (array[
    'Trivia Night', 'Yoga in the Park', 'Street Food Fest', 'Open Mic',
    '5K Fun Run', 'Board Game Meetup', 'Photography Walk', 'Farmers Market',
    'Live Jazz', 'Coding Workshop'
  ])[1 + floor(random() * 10)],
  'Auto-generated seed event for performance testing.',
  (array[
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    'https://images.unsplash.com/photo-1465447142348-e9952c393450?w=800',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=800'
  ])[1 + floor(random() * 5)],
  (array[
    'Downtown Plaza', 'Riverside Park', 'Tech Hub Coworking',
    'Ocean Beach', 'Elm Street Garden', 'Union Square'
  ])[1 + floor(random() * 6)],
  37.7749 + (random() - 0.5) * 0.2,
  -122.4194 + (random() - 0.5) * 0.2,
  now() + (floor(random() * 30) || ' days')::interval + (floor(random() * 12) || ' hours')::interval
from generate_series(1, 150) as i;
