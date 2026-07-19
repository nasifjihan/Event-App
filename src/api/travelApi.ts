import { File } from 'expo-file-system';
import { supabase } from '@/config/supabase';
import { getItem, setItem } from '@/services/mmkvStorage';
import { destinationSpotlights, planningBoardItems } from '@/features/travel/data/travelCollections';
import { EventRow } from '@/types/event';
import {
  TravelAnalyticsSnapshot,
  TravelBookingHistoryItem,
  TravelDestination,
  TravelExperience,
  TravelExperiencesPage,
  TravelModerationItem,
  TravelNotificationPreferences,
  TravelOperationsSummary,
  TravelProviderProfile,
  TravelProviderBooking,
  TravelReservationStatus,
  TravelTripPlan,
} from '@/types/travel';
import { createEvent, fetchEventsPage, NewEventInput } from '@/api/eventsApi';

const PAGE_SIZE = 10;
const COVER_IMAGES_BUCKET = 'event-covers';
const FAVORITES_KEY_PREFIX = 'travel-favorites:';
const RESERVATIONS_KEY_PREFIX = 'travel-reservations:';
const TRIP_PLANS_KEY_PREFIX = 'travel-trip-plans:';
const NOTIFICATION_PREFERENCES_KEY_PREFIX = 'travel-notification-preferences:';
const PROVIDER_PROFILE_KEY_PREFIX = 'travel-provider-profile:';

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

interface BookingHistoryRow {
  id: string;
  booking_status: string;
  booked_at: string;
  travelers_count: number;
  total_amount: number | string | null;
  currency: string | null;
  experiences:
    | {
        id: string;
        title: string;
        meeting_point: string | null;
        starts_at: string | null;
      }
    | {
        id: string;
        title: string;
        meeting_point: string | null;
        starts_at: string | null;
      }[]
    | null;
}

interface ProviderBookingRow {
  id: string;
  user_id: string;
  booking_status: string;
  booked_at: string;
  travelers_count: number;
  total_amount: number | string | null;
  currency: string | null;
  experiences:
    | {
        id: string;
        title: string;
        starts_at: string | null;
      }
    | {
        id: string;
        title: string;
        starts_at: string | null;
      }[]
    | null;
}

interface NotificationPreferencesRow {
  booking_confirmations: boolean;
  trip_reminders: boolean;
  promotions: boolean;
  provider_alerts: boolean;
}

interface ProviderProfileRow {
  user_id: string;
  business_name: string | null;
  contact_email: string | null;
  portfolio_url: string | null;
  notes: string | null;
  approval_status: string;
  reviewed_at: string | null;
}

interface AnalyticsSnapshotRow {
  id: string;
  captured_at: string;
  live_experiences: number;
  pending_bookings: number;
  confirmed_bookings: number;
  projected_revenue: number | string;
  currency: string;
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

function getStoredTripPlans(userId: string): TravelTripPlan[] {
  const raw = getItem(`${TRIP_PLANS_KEY_PREFIX}${userId}`);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TravelTripPlan[]) : [];
  } catch {
    return [];
  }
}

function setStoredTripPlans(userId: string, tripPlans: TravelTripPlan[]): void {
  setItem(`${TRIP_PLANS_KEY_PREFIX}${userId}`, JSON.stringify(tripPlans));
}

function getStoredNotificationPreferences(userId: string): TravelNotificationPreferences {
  const raw = getItem(`${NOTIFICATION_PREFERENCES_KEY_PREFIX}${userId}`);
  if (!raw) {
    return {
      bookingConfirmations: true,
      tripReminders: true,
      promotions: false,
      providerAlerts: true,
    };
  }

  try {
    const parsed = JSON.parse(raw) as TravelNotificationPreferences;
    return {
      bookingConfirmations: !!parsed.bookingConfirmations,
      tripReminders: !!parsed.tripReminders,
      promotions: !!parsed.promotions,
      providerAlerts: !!parsed.providerAlerts,
    };
  } catch {
    return {
      bookingConfirmations: true,
      tripReminders: true,
      promotions: false,
      providerAlerts: true,
    };
  }
}

function setStoredNotificationPreferences(
  userId: string,
  preferences: TravelNotificationPreferences
): void {
  setItem(`${NOTIFICATION_PREFERENCES_KEY_PREFIX}${userId}`, JSON.stringify(preferences));
}

function getStoredProviderProfile(userId: string): TravelProviderProfile {
  const raw = getItem(`${PROVIDER_PROFILE_KEY_PREFIX}${userId}`);
  if (!raw) {
    return {
      userId,
      businessName: '',
      contactEmail: null,
      portfolioUrl: null,
      notes: null,
      approvalStatus: 'not_started',
      reviewedAt: null,
    };
  }

  try {
    const parsed = JSON.parse(raw) as TravelProviderProfile;
    return {
      userId,
      businessName: parsed.businessName ?? '',
      contactEmail: parsed.contactEmail ?? null,
      portfolioUrl: parsed.portfolioUrl ?? null,
      notes: parsed.notes ?? null,
      approvalStatus:
        parsed.approvalStatus === 'approved' ||
        parsed.approvalStatus === 'rejected' ||
        parsed.approvalStatus === 'pending'
          ? parsed.approvalStatus
          : 'not_started',
      reviewedAt: parsed.reviewedAt ?? null,
    };
  } catch {
    return {
      userId,
      businessName: '',
      contactEmail: null,
      portfolioUrl: null,
      notes: null,
      approvalStatus: 'not_started',
      reviewedAt: null,
    };
  }
}

function setStoredProviderProfile(profile: TravelProviderProfile): void {
  setItem(`${PROVIDER_PROFILE_KEY_PREFIX}${profile.userId}`, JSON.stringify(profile));
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

function mapBookingHistory(row: BookingHistoryRow): TravelBookingHistoryItem | null {
  const experience = Array.isArray(row.experiences) ? row.experiences[0] : row.experiences;
  if (!experience) return null;

  return {
    id: row.id,
    experienceId: experience.id,
    title: experience.title,
    bookingStatus: row.booking_status,
    bookedAt: row.booked_at,
    startsAt: experience.starts_at,
    locationName: experience.meeting_point,
    travelersCount: row.travelers_count,
    totalAmount: row.total_amount == null ? null : Number(row.total_amount),
    currency: row.currency,
  };
}

function mapProviderBooking(
  row: ProviderBookingRow,
  travelerLabel: string
): TravelProviderBooking | null {
  const experience = Array.isArray(row.experiences) ? row.experiences[0] : row.experiences;
  if (!experience) return null;

  return {
    id: row.id,
    experienceId: experience.id,
    experienceTitle: experience.title,
    travelerLabel,
    bookingStatus: row.booking_status,
    bookedAt: row.booked_at,
    startsAt: experience.starts_at,
    travelersCount: row.travelers_count,
    totalAmount: row.total_amount == null ? null : Number(row.total_amount),
    currency: row.currency,
  };
}

function mapNotificationPreferences(row: NotificationPreferencesRow): TravelNotificationPreferences {
  return {
    bookingConfirmations: row.booking_confirmations,
    tripReminders: row.trip_reminders,
    promotions: row.promotions,
    providerAlerts: row.provider_alerts,
  };
}

function mapProviderProfile(row: ProviderProfileRow): TravelProviderProfile {
  return {
    userId: row.user_id,
    businessName: row.business_name ?? '',
    contactEmail: row.contact_email,
    portfolioUrl: row.portfolio_url,
    notes: row.notes,
    approvalStatus:
      row.approval_status === 'approved' ||
      row.approval_status === 'rejected' ||
      row.approval_status === 'pending'
        ? row.approval_status
        : 'not_started',
    reviewedAt: row.reviewed_at,
  };
}

function mapAnalyticsSnapshot(row: AnalyticsSnapshotRow): TravelAnalyticsSnapshot {
  return {
    id: row.id,
    capturedAt: row.captured_at,
    liveExperiences: row.live_experiences,
    pendingBookings: row.pending_bookings,
    confirmedBookings: row.confirmed_bookings,
    projectedRevenue: Number(row.projected_revenue),
    currency: row.currency,
  };
}

async function queueNotification(args: {
  userId: string;
  category: string;
  title: string;
  body: string;
  relatedBookingId?: string;
  relatedExperienceId?: string;
}): Promise<void> {
  const { error } = await supabase.from('notification_queue').insert({
    user_id: args.userId,
    category: args.category,
    title: args.title,
    body: args.body,
    related_booking_id: args.relatedBookingId ?? null,
    related_experience_id: args.relatedExperienceId ?? null,
  });

  if (error && !isMissingTravelSchemaError(error.message)) {
    throw new Error(error.message);
  }
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
      status: 'pending_review',
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
    const storedPlans = getStoredTripPlans(userId);
    return storedPlans.length > 0 ? storedPlans : planningBoardItems;
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

export async function fetchHostedExperiences(userId: string): Promise<TravelExperience[]> {
  const { data, error } = await supabase
    .from('experiences')
    .select(
      'id, host_id, title, summary, body, cover_image_url, meeting_point, starts_at, created_at, status, price_amount, currency, duration_minutes, capacity'
    )
    .eq('host_id', userId)
    .order('created_at', { ascending: false });

  if (!error) {
    const rows = (data as ExperienceRow[] | null) ?? [];
    if (rows.length > 0) {
      return rows.map(mapExperience);
    }
  }

  if (!error || isMissingTravelSchemaError(error.message)) {
    const { data: legacyData, error: legacyError } = await supabase
      .from('events')
      .select('*')
      .eq('host_id', userId)
      .order('created_at', { ascending: false });

    if (legacyError) throw new Error(legacyError.message);
    return ((legacyData as EventRow[] | null) ?? []).map(mapLegacyEvent);
  }

  throw new Error(error.message);
}

export interface UpsertTravelExperienceInput {
  experienceId: string;
  title: string;
  description: string;
  locationName: string;
  startsAt: Date;
  localImageUri: string | null;
  existingImageUrl: string | null;
}

export async function updateTravelExperience(input: UpsertTravelExperienceInput): Promise<TravelExperience> {
  let coverImageUrl = input.existingImageUrl;

  const existingExperienceResult = await supabase
    .from('experiences')
    .select('host_id')
    .eq('id', input.experienceId)
    .single();

  if (existingExperienceResult.error) {
    throw new Error(existingExperienceResult.error.message);
  }

  if (input.localImageUri && input.localImageUri !== input.existingImageUrl) {
    coverImageUrl = await uploadTravelImage(input.localImageUri, existingExperienceResult.data.host_id);
  }

  const { data, error } = await supabase
    .from('experiences')
    .update({
      title: input.title,
      summary: input.description || null,
      body: input.description || null,
      meeting_point: input.locationName || null,
      cover_image_url: coverImageUrl,
      starts_at: input.startsAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.experienceId)
    .select(
      'id, host_id, title, summary, body, cover_image_url, meeting_point, starts_at, created_at, status, price_amount, currency, duration_minutes, capacity'
    )
    .single();

  if (error) throw new Error(error.message);
  return mapExperience(data as ExperienceRow);
}

export async function toggleHostedExperienceStatus(experience: TravelExperience): Promise<void> {
  if (experience.source !== 'experience') {
    throw new Error('Legacy events should be migrated before using provider status controls.');
  }

  const nextStatus = experience.status === 'live' ? 'draft' : 'live';
  const { error } = await supabase
    .from('experiences')
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', experience.id);

  if (error) throw new Error(error.message);
}

export async function fetchProviderBookings(userId: string): Promise<TravelProviderBooking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, user_id, booking_status, booked_at, travelers_count, total_amount, currency, experiences!inner ( id, title, starts_at, host_id )'
    )
    .eq('experiences.host_id', userId)
    .order('booked_at', { ascending: false });

  if (!error) {
    const rows = ((data as Array<ProviderBookingRow & { experiences: ProviderBookingRow['experiences'] & { host_id?: string } }> | null) ?? [])
      .map((row) => ({
        ...row,
        experiences: Array.isArray(row.experiences)
          ? row.experiences.map(({ id, title, starts_at }) => ({ id, title, starts_at }))
          : row.experiences
            ? {
                id: row.experiences.id,
                title: row.experiences.title,
                starts_at: row.experiences.starts_at,
              }
            : null,
      })) as ProviderBookingRow[];

    const travelerIds = Array.from(new Set(rows.map((row) => row.user_id)));
    const { data: profileRows } =
      travelerIds.length > 0
        ? await supabase.from('profiles').select('id, full_name').in('id', travelerIds)
        : { data: [] };

    const travelerMap = new Map(
      ((profileRows as Array<{ id: string; full_name: string | null }> | null) ?? []).map((profile) => [
        profile.id,
        profile.full_name || 'Traveler',
      ])
    );

    return rows
      .map((row) => mapProviderBooking(row, travelerMap.get(row.user_id) ?? 'Traveler'))
      .filter((item): item is TravelProviderBooking => Boolean(item));
  }

  if (isMissingTravelSchemaError(error.message)) {
    return [];
  }

  throw new Error(error.message);
}

export async function updateProviderBookingStatus(
  bookingId: string,
  bookingStatus: 'pending' | 'confirmed' | 'cancelled'
): Promise<void> {
  const bookingLookup = await supabase
    .from('bookings')
    .select('id, user_id, experience_id')
    .eq('id', bookingId)
    .single();

  if (bookingLookup.error) {
    throw new Error(bookingLookup.error.message);
  }

  const { error } = await supabase
    .from('bookings')
    .update({ booking_status: bookingStatus })
    .eq('id', bookingId);

  if (error) throw new Error(error.message);

  await queueNotification({
    userId: bookingLookup.data.user_id,
    category: 'booking_status',
    title: bookingStatus === 'confirmed' ? 'Booking confirmed' : bookingStatus === 'cancelled' ? 'Booking cancelled' : 'Booking updated',
    body:
      bookingStatus === 'confirmed'
        ? 'Your reservation has been confirmed by the provider.'
        : bookingStatus === 'cancelled'
          ? 'Your reservation has been cancelled by the provider.'
          : 'Your reservation status has changed.',
    relatedBookingId: bookingId,
    relatedExperienceId: bookingLookup.data.experience_id,
  });
}

export async function fetchTravelOperationsSummary(userId: string): Promise<TravelOperationsSummary> {
  const [experiences, bookings] = await Promise.all([
    fetchHostedExperiences(userId),
    fetchProviderBookings(userId),
  ]);

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((item) => item.bookingStatus === 'confirmed').length;
  const pendingBookings = bookings.filter((item) => item.bookingStatus === 'pending').length;
  const projectedRevenue = bookings.reduce((sum, item) => sum + (item.totalAmount ?? 0), 0);

  return {
    liveExperiences: experiences.filter((item) => item.status === 'live').length,
    draftExperiences: experiences.filter((item) => item.status !== 'live').length,
    nativeExperiences: experiences.filter((item) => item.source === 'experience').length,
    legacyExperiences: experiences.filter((item) => item.source !== 'experience').length,
    totalBookings,
    confirmedBookings,
    pendingBookings,
    projectedRevenue,
    currency: bookings.find((item) => item.currency)?.currency ?? 'USD',
  };
}

export async function fetchBookingHistory(userId: string): Promise<TravelBookingHistoryItem[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, booking_status, booked_at, travelers_count, total_amount, currency, experiences ( id, title, meeting_point, starts_at )'
    )
    .eq('user_id', userId)
    .order('booked_at', { ascending: false });

  if (!error) {
    const rows = (data as BookingHistoryRow[] | null) ?? [];
    return rows
      .map(mapBookingHistory)
      .filter((item): item is TravelBookingHistoryItem => Boolean(item));
  }

  if (isMissingTravelSchemaError(error.message)) {
    const fallbackIds = getStoredIds(RESERVATIONS_KEY_PREFIX, userId);
    const fallbackExperiences = await fetchSavedFallbackExperiences(fallbackIds);
    return fallbackExperiences.map((experience) => ({
      id: `fallback-${experience.id}`,
      experienceId: experience.id,
      title: experience.title,
      bookingStatus: 'saved',
      bookedAt: experience.created_at,
      startsAt: experience.starts_at,
      locationName: experience.location_name,
      travelersCount: 1,
      totalAmount: experience.price_amount,
      currency: experience.currency,
    }));
  }

  throw new Error(error.message);
}

export async function fetchDestinationById(destinationId: string): Promise<TravelDestination> {
  const { data, error } = await supabase
    .from('destinations')
    .select('id, title, country, summary, hero_image_url, is_featured')
    .eq('id', destinationId)
    .single();

  if (!error && data) {
    return mapDestination(data as DestinationRow);
  }

  const fallback = destinationSpotlights.find((destination) => destination.id === destinationId);
  if (fallback) return fallback;

  if (error && !isMissingTravelSchemaError(error.message)) {
    throw new Error(error.message);
  }

  throw new Error('Destination not found');
}

export interface CreateTripPlanInput {
  userId: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  notes: string;
}

export async function createTripPlan(input: CreateTripPlanInput): Promise<TravelTripPlan> {
  const { data, error } = await supabase
    .from('trip_plans')
    .insert({
      user_id: input.userId,
      title: input.title,
      start_date: input.startDate,
      end_date: input.endDate,
      notes: input.notes || null,
      status: 'draft',
    })
    .select('id, title, start_date, end_date, status, notes')
    .single();

  if (error) {
    if (isMissingTravelSchemaError(error.message)) {
      const localPlan: TravelTripPlan = {
        id: `local-${Date.now()}`,
        title: input.title,
        subtitle: input.notes || 'Created locally until the travel schema is applied.',
        status: 'draft',
        windowLabel:
          input.startDate && input.endDate
            ? `${input.startDate} - ${input.endDate}`
            : 'Dates to be confirmed',
      };
      setStoredTripPlans(input.userId, [localPlan, ...getStoredTripPlans(input.userId)]);
      return localPlan;
    }
    throw new Error(error.message);
  }
  return mapTripPlan(data as TripPlanRow);
}

export async function fetchNotificationPreferences(
  userId: string
): Promise<TravelNotificationPreferences> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('booking_confirmations, trip_reminders, promotions, provider_alerts')
    .eq('user_id', userId)
    .maybeSingle();

  if (!error && data) {
    return mapNotificationPreferences(data as NotificationPreferencesRow);
  }

  if (!error) {
    return getStoredNotificationPreferences(userId);
  }

  if (isMissingTravelSchemaError(error.message)) {
    return getStoredNotificationPreferences(userId);
  }

  throw new Error(error.message);
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: TravelNotificationPreferences
): Promise<TravelNotificationPreferences> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert(
      {
        user_id: userId,
        booking_confirmations: preferences.bookingConfirmations,
        trip_reminders: preferences.tripReminders,
        promotions: preferences.promotions,
        provider_alerts: preferences.providerAlerts,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id', ignoreDuplicates: false }
    )
    .select('booking_confirmations, trip_reminders, promotions, provider_alerts')
    .single();

  if (!error && data) {
    return mapNotificationPreferences(data as NotificationPreferencesRow);
  }

  if (error && !isMissingTravelSchemaError(error.message)) {
    throw new Error(error.message);
  }

  setStoredNotificationPreferences(userId, preferences);
  return preferences;
}

export async function upsertExpoPushToken(userId: string, expoPushToken: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      expo_push_token: expoPushToken,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error && !isMissingTravelSchemaError(error.message)) {
    throw new Error(error.message);
  }
}

export async function fetchProviderProfile(userId: string): Promise<TravelProviderProfile> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('user_id, business_name, contact_email, portfolio_url, notes, approval_status, reviewed_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (!error && data) {
    return mapProviderProfile(data as ProviderProfileRow);
  }

  if (!error) {
    return getStoredProviderProfile(userId);
  }

  if (isMissingTravelSchemaError(error.message)) {
    return getStoredProviderProfile(userId);
  }

  throw new Error(error.message);
}

export interface SubmitProviderOnboardingInput {
  userId: string;
  businessName: string;
  contactEmail: string;
  portfolioUrl: string;
  notes: string;
}

export async function submitProviderOnboarding(
  input: SubmitProviderOnboardingInput
): Promise<TravelProviderProfile> {
  const payload = {
    user_id: input.userId,
    business_name: input.businessName,
    contact_email: input.contactEmail || null,
    portfolio_url: input.portfolioUrl || null,
    notes: input.notes || null,
    approval_status: 'pending',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('provider_profiles')
    .upsert(payload, { onConflict: 'user_id', ignoreDuplicates: false })
    .select('user_id, business_name, contact_email, portfolio_url, notes, approval_status, reviewed_at')
    .single();

  if (!error && data) {
    return mapProviderProfile(data as ProviderProfileRow);
  }

  if (error && !isMissingTravelSchemaError(error.message)) {
    throw new Error(error.message);
  }

  const fallback: TravelProviderProfile = {
    userId: input.userId,
    businessName: input.businessName,
    contactEmail: input.contactEmail || null,
    portfolioUrl: input.portfolioUrl || null,
    notes: input.notes || null,
    approvalStatus: 'pending',
    reviewedAt: null,
  };
  setStoredProviderProfile(fallback);
  return fallback;
}

export async function fetchModerationQueue(): Promise<TravelModerationItem[]> {
  const [providersResult, experiencesResult] = await Promise.all([
    supabase
      .from('provider_profiles')
      .select('user_id, business_name, contact_email, notes, approval_status, created_at')
      .eq('approval_status', 'pending'),
    supabase
      .from('experiences')
      .select('id, title, summary, status, created_at')
      .eq('status', 'pending_review'),
  ]);

  const combinedMessage = [providersResult.error?.message, experiencesResult.error?.message]
    .filter(Boolean)
    .join(' ');

  if (combinedMessage && !isMissingTravelSchemaError(combinedMessage)) {
    throw new Error(combinedMessage);
  }

  const providerItems = (((providersResult.data as Array<ProviderProfileRow & { created_at?: string }> | null) ?? [])).map(
    (provider) => ({
      id: provider.user_id,
      title: provider.business_name || 'Provider application',
      entityType: 'provider' as const,
      status: 'pending' as const,
      submittedAt: provider.created_at ?? new Date().toISOString(),
      submittedByLabel: provider.contact_email || 'Provider applicant',
      notes: provider.notes ?? null,
    })
  );

  const experienceItems = (((experiencesResult.data as Array<ExperienceRow & { created_at: string }> | null) ?? [])).map(
    (experience) => ({
      id: experience.id,
      title: experience.title,
      entityType: 'experience' as const,
      status: 'pending' as const,
      submittedAt: experience.created_at,
      submittedByLabel: 'Provider submission',
      notes: experience.summary ?? null,
    })
  );

  return [...providerItems, ...experienceItems].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

export async function updateModerationItem(
  item: Pick<TravelModerationItem, 'id' | 'entityType'>,
  decision: 'approved' | 'rejected'
): Promise<void> {
  if (item.entityType === 'provider') {
    const { error } = await supabase
      .from('provider_profiles')
      .update({
        approval_status: decision,
        reviewed_at: new Date().toISOString(),
      })
      .eq('user_id', item.id);

    if (error && !isMissingTravelSchemaError(error.message)) {
      throw new Error(error.message);
    }
    return;
  }

  const { error } = await supabase
    .from('experiences')
    .update({
      status: decision === 'approved' ? 'live' : 'draft',
      updated_at: new Date().toISOString(),
    })
    .eq('id', item.id);

  if (error && !isMissingTravelSchemaError(error.message)) {
    throw new Error(error.message);
  }
}

export async function captureTravelAnalyticsSnapshot(
  userId: string
): Promise<TravelAnalyticsSnapshot> {
  const summary = await fetchTravelOperationsSummary(userId);
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .insert({
      owner_user_id: userId,
      live_experiences: summary.liveExperiences,
      pending_bookings: summary.pendingBookings,
      confirmed_bookings: summary.confirmedBookings,
      projected_revenue: summary.projectedRevenue,
      currency: summary.currency,
    })
    .select(
      'id, captured_at, live_experiences, pending_bookings, confirmed_bookings, projected_revenue, currency'
    )
    .single();

  if (!error && data) {
    return mapAnalyticsSnapshot(data as AnalyticsSnapshotRow);
  }

  if (error && !isMissingTravelSchemaError(error.message)) {
    throw new Error(error.message);
  }

  return {
    id: `local-${Date.now()}`,
    capturedAt: new Date().toISOString(),
    liveExperiences: summary.liveExperiences,
    pendingBookings: summary.pendingBookings,
    confirmedBookings: summary.confirmedBookings,
    projectedRevenue: summary.projectedRevenue,
    currency: summary.currency,
  };
}

export async function fetchTravelAnalyticsSnapshots(
  userId: string
): Promise<TravelAnalyticsSnapshot[]> {
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select(
      'id, captured_at, live_experiences, pending_bookings, confirmed_bookings, projected_revenue, currency'
    )
    .eq('owner_user_id', userId)
    .order('captured_at', { ascending: false })
    .limit(6);

  if (!error) {
    return ((data as AnalyticsSnapshotRow[] | null) ?? []).map(mapAnalyticsSnapshot);
  }

  if (isMissingTravelSchemaError(error.message)) {
    const summary = await fetchTravelOperationsSummary(userId);
    return [
      {
        id: 'computed-latest',
        capturedAt: new Date().toISOString(),
        liveExperiences: summary.liveExperiences,
        pendingBookings: summary.pendingBookings,
        confirmedBookings: summary.confirmedBookings,
        projectedRevenue: summary.projectedRevenue,
        currency: summary.currency,
      },
    ];
  }

  throw new Error(error.message);
}
