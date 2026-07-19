-- Run this AFTER schema.sql, in Supabase SQL Editor.
-- Replace 'YOUR_USER_ID' with your actual user id, which you can find at:
-- Supabase dashboard > Authentication > Users > (click your user) > copy the UID

insert into public.events (host_id, title, description, cover_image_url, location_name, latitude, longitude, starts_at)
values
  ('446292c6-2a7b-4753-b0b8-b3e0b06cce54', 'Sunset Beach Volleyball', 'Casual pickup games, all levels welcome.', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800', 'Ocean Beach', 37.7594, -122.5107, now() + interval '2 days'),
  ('446292c6-2a7b-4753-b0b8-b3e0b06cce54', 'Indie Bookstore Poetry Night', 'Open mic poetry reading, coffee provided.', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800', 'Paper Trail Books', 37.7749, -122.4194, now() + interval '4 days'),
  ('446292c6-2a7b-4753-b0b8-b3e0b06cce54', 'Weekend Farmers Market', 'Local produce, live music, food trucks.', 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800', 'Downtown Plaza', 37.7833, -122.4167, now() + interval '1 day'),
  ('446292c6-2a7b-4753-b0b8-b3e0b06cce54', 'React Native Meetup', 'Talks on Reanimated and performance tuning.', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', 'Tech Hub Coworking', 37.7690, -122.4260, now() + interval '6 days'),
  ('446292c6-2a7b-4753-b0b8-b3e0b06cce54', 'Community Garden Cleanup', 'Bring gloves, snacks provided.', 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800', 'Elm Street Garden', 37.7599, -122.4148, now() + interval '3 days');
