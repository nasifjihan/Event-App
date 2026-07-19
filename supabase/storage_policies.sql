-- Run this AFTER creating the 'event-covers' bucket in the dashboard
-- (Storage > New bucket > name: event-covers > Public bucket: ON)
--
-- These policies let any logged-in user upload images, and let anyone
-- (even logged-out) view them, since event cover photos aren't sensitive.

create policy "Anyone can view event cover images"
  on storage.objects for select
  using (bucket_id = 'event-covers');

create policy "Authenticated users can upload event cover images"
  on storage.objects for insert
  with check (bucket_id = 'event-covers' and auth.role() = 'authenticated');

create policy "Users can update their own uploaded images"
  on storage.objects for update
  using (bucket_id = 'event-covers' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own uploaded images"
  on storage.objects for delete
  using (bucket_id = 'event-covers' and auth.uid()::text = (storage.foldername(name))[1]);
