insert into public.destinations (slug, title, country, summary, hero_image_url, is_featured)
values
  (
    'bali-escape',
    'Bali Escape',
    'Indonesia',
    'Wellness stays, surf mornings, and curated resort itineraries.',
    'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20tropical%20travel%20destination%20with%20infinity%20pool%2C%20palm%20trees%2C%20warm%20sunset%2C%20cinematic%20resort%20photography%2C%20realistic%2C%20premium%20editorial%20travel%20magazine%20style&image_size=landscape_16_9',
    true
  ),
  (
    'dubai-signature',
    'Dubai Signature',
    'United Arab Emirates',
    'Skyline dining, premium hotels, and polished city itineraries.',
    'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern%20luxury%20travel%20destination%20city%20skyline%20with%20high-end%20hotel%20terrace%2C%20golden%20hour%2C%20realistic%20architectural%20travel%20photography%2C%20premium%20editorial%20style&image_size=landscape_16_9',
    true
  ),
  (
    'alpine-route',
    'Alpine Route',
    'Switzerland',
    'Scenic rail days, mountain lodges, and quiet panoramic stops.',
    'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=majestic%20swiss%20alps%20travel%20destination%20with%20mountain%20lodge%2C%20clean%20lake%2C%20morning%20light%2C%20realistic%20premium%20travel%20photography%2C%20editorial%20quality&image_size=landscape_16_9',
    true
  )
on conflict (slug) do update
set
  title = excluded.title,
  country = excluded.country,
  summary = excluded.summary,
  hero_image_url = excluded.hero_image_url,
  is_featured = excluded.is_featured;
