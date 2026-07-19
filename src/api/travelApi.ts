import { File } from 'expo-file-system';
import { supabase } from '@/config/supabase';
import { getItem, setItem } from '@/services/mmkvStorage';
import { destinationSpotlights, planningBoardItems } from '@/features/travel/data/travelCollections';
import { EventRow } from '@/types/event';
import {
  TravelDestination,
  TravelExperience,
  TravelExperiencesPage,
  TravelReservationStatus,
  TravelTripPlan,
} from '@/types/travel';
import { createEvent, fetchEventsPage, NewEventInput } from '@/api/eventsApi';

const PAGE_SIZE = 10;
const COVER_IMAGES_BUCKET = 'event-covers';
const FAVORITES_KEY_PREFIX = 'travel-favorites:';
const RESERVATIONS_KEY_PREFIX = 'travel-reservations:';

interface ExperienceRow {
  id: string;
  host_id: string;
  title: string;
  summary: string | null;
  body: string | null;
  cover_image_url: string | null;
  meeting_point: string | null;
  starts_at: string | null;
  created_at: string;
  status: string;
  price_amount: number | string | null;
  currency: string | null;
  duration_minutes: number | null;
  capacity: number | null;
}

interface DestinationRow {
  id: string;
  title: string;
  country: string;
  summary: string | null;
  hero_image_url: string | null;
  is_featured: boolean;
}

interface TripPlanRow {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  notes: string | null;
}

function isMissingTravelSchemaError(message: string): boolean {
  return /relation .* does not exist|could not find the table|schema cache|column .* does not exist/i.test(message);
}

function getStoredIds(prefix: string, userId: string): string[] {
  const raw = getItem(`${prefix}${userId}`);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function setStoredIds(prefix: string, userId: string, ids: string[]): void {
  setItem(`${prefix}${userId}`, JSON.stringify(ids));
}

function toggleStoredId(prefix: string, userId: string, id: string): boolean {
  const current = getStoredIds(prefix, userId);
  const exists = current.includes(id);
  const next = exists ? current.filter((value) => value !== id) : [...current, id];
  setStoredIds(prefix, userId, next);
  return !exists;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function mapLegacyEvent(event: EventRow): TravelExperience {
  return {
    id: event.id,
    source: 'legacy_event',
    host_id: event.host_id,
    title: event.title,
    description: event.description,
    summary: event.description,
    cover_image_url: event.cover_image_url,
    location_name: event.location_name,
    latitude: event.latitude,
    longitude: event.longitude,
    starts_at: event.starts_at,
    created_at: event.created_at,
    status: 'live',
    price_amount: null,
    currency: null,
    duration_minutes: null,
    capacity: null,
  };
}

function mapExperience(row: ExperienceRow): TravelExperience {
  return {
    id: row.id,
    source: 'experience',
    host_id: row.host_id,
    title: row.title,
    description: row.body,
    summary: row.summary,
    cover_image_url: row.cover_image_url,
    location_name: row.meeting_point,
    latitude: null,
    longitude: null,
    starts_at: row.starts_at ?? row.created_at,
    created_at: row.created_at,
    status: row.status,
    price_amount: row.price_amount == null ? null : Number(row.price_amount),
    currency: row.currency,
    duration_minutes: row.duration_minutes,
    capacity: row.capacity,
  };
}

function mapDestination(row: DestinationRow): TravelDestination {
  return {
    id: row.id,
    title: row.title,
    country: row.country,
    tagline: row.summary ?? 'Curated destination ready for itineraries and bookings.',
    imageUrl:
      row.hero_image_url ??
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=refined%20travel%20destination%20hero%20image%2C%20luxury%20editorial%20tourism%20photography%2C%20realistic%20and%20premium&image_size=landscape_16_9',
    bestFor: row.is_featured ? 'Featured collection' : 'Travel inspiration',
  };
}

function mapTripPlan(row: TripPlanRow): TravelTripPlan {
  const status = row.status === 'booked' || row.status === 'saved' ? row.status : 'draft';
  const parts = [row.start_date, row.end_date].filter(Boolean);

  return {
    id: row.id,
    title: row.title,
    subtitle: row.notes ?? 'A saved travel plan connected to your new planning workflow.',
    status,
    windowLabel: parts.length > 0 ? parts.join(' - ') : 'Dates to be confirmed',
  };
}

async function uploadTravelImage(localUri: string, hostId: string): Promise<string> {
  const file = new File(localUri);
  const bytes = await file.bytes();
  const binary = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;

  const fileExt = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filePath = `${hostId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(COVER_IMAGES_BUCKET)
    .upload(filePath, binary, {
      contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
    });

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(COVER_IMAGES_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

async function fetchSavedFallbackExperiences(ids: string[]): Promise<TravelExperience[]> {
  if (ids.length === 0) return [];

  const [experienceResult, eventResult] = await Promise.all([
    supabase
      .from('experiences')
      .select(
        'id, host_id, title, summary, body, cover_image_url, meeting_point, starts_at, created_at, status, price_amount, currency, duration_minutes, capacity'
      )
      .in('id', ids),
    supabase
      .from('events')
      .select('*')
      .in('id', ids),
  ]);

  const experiences = experienceResult.error ? [] : ((experienceResult.data as ExperienceRow[] | null) ?? []).map(mapExperience);
  const legacyEvents = eventResult.error ? [] : ((eventResult.data as EventRow[] | null) ?? []).map(mapLegacyEvent);

  const merged = [...experiences, ...legacyEvents];
  return ids
    .map((id) => merged.find((item) => item.id === id))
    .filter((item): item is TravelExperience => Boolean(item));
}

export async function ensureTravelProfile(userId: string, fullName?: string | null): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      full_name: fullName ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id', ignoreDuplicates: false }
  );

  if (error && !isMissingTravelSchemaError(error.message)) {
    throw new Error(error.message);
  }
}

export async function fetchTravelExperiencesPage(
  page: number,
  searchQuery: string
): Promise<TravelExperiencesPage> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE;

  let experiencesQuery = supabase
    .from('experiences')
    .select(
      'id, host_id, title, summary, body, cover_image_url, meeting_point, starts_at, created_at, status, price_amount, currency, duration_minutes, capacity'
    )
    .in('status', ['published', 'live'])
    .order('starts_at', { ascending: true })
    .range(from, to);

  if (searchQuery.trim().length > 0) {
    experiencesQuery = experiencesQuery.ilike('title', `%${searchQuery.trim()}%`);
  }

  const { data, error } = await experiencesQuery;

  if (!error) {
    const rows = (data as ExperienceRow[] | null) ?? [];
    if (rows.length > 0) {
      const hasNextPage = rows.length > PAGE_SIZE;
      const visibleRows = hasNextPage ? rows.slice(0, PAGE_SIZE) : rows;

      return {
        experiences: visibleRows.map(mapExperience),
        nextPage: hasNextPage ? page + 1 : null,
      };
    }
  }

  if (!error || isMissingTravelSchemaError(error.message)) {
    const legacyPage = await fetchEventsPage(page, searchQuery);
    return {
      experiences: legacyPage.events.map(mapLegacyEvent),
      nextPage: legacyPage.nextPage,
    };
  }

  throw new Error(error.message);
}

export async function fetchFeaturedDestinations(): Promise<TravelDestination[]> {
  const { data, error } = await supabase
    .from('destinations')
    .select('id, title, country, summary, hero_image_url, is_featured')
    .order('is_featured', { ascending: false })
    .limit(6);

  if (!error) {
    const rows = (data as DestinationRow[] | null) ?? [];
    if (rows.length > 0) {
      return rows.map(mapDestination);
    }
  }

  if (error && !isMissingTravelSchemaError(error.message)) {
    throw new Error(error.message);
  }

  return destinationSpotlights.map((destination) => ({
    id: destination.id,
    title: destination.title,
    country: destination.country,
    tagline: destination.tagline,
    imageUrl: destination.imageUrl,
    bestFor: destination.bestFor,
  }));
}

export async function createTravelExperience(input: NewEventInput): Promise<TravelExperience> {
  let coverImageUrl: string | null = null;

  if (input.localImageUri) {
    coverImageUrl = await uploadTravelImage(input.localImageUri, input.hostId);
  }

  const slugBase = slugify(input.title) || 'experience';
  const { data, error } = await supabase
    .from('experiences')
    .insert({
      host_id: input.hostId,
      title: input.title,
      slug: `${slugBase}-${Date.now()}`,
      summary: input.description || null,
      body: input.description || null,
      meeting_point: input.locationName || null,
      cover_image_url: coverImageUrl,
      starts_at: input.startsAt.toISOString(),
      status: 'live',
    })
    .select(
      'id, host_id, title, summary, body, cover_image_url, meeting_point, starts_at, created_at, status, price_amount, currency, duration_minutes, capacity'
    )
    .single();

  if (!error && data) {
    return mapExperience(data as ExperienceRow);
  }

  if (error && !isMissingTravelSchemaError(error.message)) {
    throw new Error(error.message);
  }

  const legacyEvent = await createEvent(input);
  return mapLegacyEvent(legacyEvent);
}

export async function fetchFavoriteExperiences(userId: string): Promise<TravelExperience[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id, experience_id')
    .eq('user_id', userId)
    .not('experience_id', 'is', null)
    .order('created_at', { ascending: false });

  if (!error) {
    const favoriteIds = ((data as Array<{ experience_id: string | null }> | null) ?? [])
      .map((row) => row.experience_id)
      .filter((id): id is string => Boolean(id));

    if (favoriteIds.length === 0) {
      return [];
    }

    return fetchSavedFallbackExperiences(favoriteIds);
  }

  if (isMissingTravelSchemaError(error.message)) {
    return fetchSavedFallbackExperiences(getStoredIds(FAVORITES_KEY_PREFIX, userId));
  }

  throw new Error(error.message);
}

export async function toggleFavoriteExperience(userId: string, experienceId: string): Promise<boolean> {
  const existingResult = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('experience_id', experienceId)
    .maybeSingle();

  if (!existingResult.error) {
    if (existingResult.data?.id) {
      const { error } = await supabase.from('favorites').delete().eq('id', existingResult.data.id);
      if (error) throw new Error(error.message);
      return false;
    }

    const { error } = await supabase.from('favorites').insert({
      user_id: userId,
      experience_id: experienceId,
    });
    if (error) throw new Error(error.message);
    return true;
  }

  if (isMissingTravelSchemaError(existingResult.error.message)) {
    return toggleStoredId(FAVORITES_KEY_PREFIX, userId, experienceId);
  }

  throw new Error(existingResult.error.message);
}

export async function fetchTripPlans(userId: string): Promise<TravelTripPlan[]> {
  const { data, error } = await supabase
    .from('trip_plans')
    .select('id, title, start_date, end_date, status, notes')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (!error) {
    const rows = (data as TripPlanRow[] | null) ?? [];
    if (rows.length > 0) {
      return rows.map(mapTripPlan);
    }
    return [];
  }

  if (isMissingTravelSchemaError(error.message)) {
    return planningBoardItems;
  }

  throw new Error(error.message);
}

export async function fetchExperienceReservationStatus(
  userId: string,
  experience: TravelExperience
): Promise<TravelReservationStatus> {
  if (experience.source === 'legacy_event') {
    const [countResult, mineResult] = await Promise.all([
      supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', experience.id),
      supabase
        .from('event_attendees')
        .select('user_id')
        .eq('event_id', experience.id)
        .eq('user_id', userId)
        .maybeSingle(),
    ]);

    if (countResult.error) throw new Error(countResult.error.message);
    if (mineResult.error) throw new Error(mineResult.error.message);

    return {
      count: countResult.count ?? 0,
      isReserved: !!mineResult.data,
    };
  }

  const [countResult, mineResult] = await Promise.all([
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('experience_id', experience.id)
      .in('booking_status', ['pending', 'confirmed']),
    supabase
      .from('bookings')
      .select('id')
      .eq('experience_id', experience.id)
      .eq('user_id', userId)
      .in('booking_status', ['pending', 'confirmed'])
      .maybeSingle(),
  ]);

  if (!countResult.error && !mineResult.error) {
    return {
      count: countResult.count ?? 0,
      isReserved: !!mineResult.data,
    };
  }

  const combinedMessage = [countResult.error?.message, mineResult.error?.message].filter(Boolean).join(' ');
  if (isMissingTravelSchemaError(combinedMessage)) {
    const reservedIds = getStoredIds(RESERVATIONS_KEY_PREFIX, userId);
    return {
      count: reservedIds.includes(experience.id) ? 1 : 0,
      isReserved: reservedIds.includes(experience.id),
    };
  }

  throw new Error(combinedMessage || 'Could not load reservation status');
}

export async function toggleExperienceReservation(
  userId: string,
  experience: TravelExperience
): Promise<void> {
  if (experience.source === 'legacy_event') {
    const { data: mineResult, error: mineError } = await supabase
      .from('event_attendees')
      .select('user_id')
      .eq('event_id', experience.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (mineError) throw new Error(mineError.message);

    if (mineResult) {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', experience.id)
        .eq('user_id', userId);
      if (error) throw new Error(error.message);
      return;
    }

    const { error } = await supabase
      .from('event_attendees')
      .insert({ event_id: experience.id, user_id: userId });
    if (error) throw new Error(error.message);
    return;
  }

  const existingResult = await supabase
    .from('bookings')
    .select('id')
    .eq('experience_id', experience.id)
    .eq('user_id', userId)
    .in('booking_status', ['pending', 'confirmed'])
    .maybeSingle();

  if (!existingResult.error) {
    if (existingResult.data?.id) {
      const { error } = await supabase.from('bookings').delete().eq('id', existingResult.data.id);
      if (error) throw new Error(error.message);
      return;
    }

    const { error } = await supabase.from('bookings').insert({
      user_id: userId,
      experience_id: experience.id,
      booking_status: 'pending',
      travelers_count: 1,
      total_amount: experience.price_amount,
      currency: experience.currency ?? 'USD',
    });
    if (error) throw new Error(error.message);
    return;
  }

  if (isMissingTravelSchemaError(existingResult.error.message)) {
    toggleStoredId(RESERVATIONS_KEY_PREFIX, userId, experience.id);
    return;
  }

  throw new Error(existingResult.error.message);
}
