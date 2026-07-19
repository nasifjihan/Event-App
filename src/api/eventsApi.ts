import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/config/supabase';
import { EventRow, EventsPage } from '@/types/event';

const PAGE_SIZE = 10;
const COVER_IMAGES_BUCKET = 'event-covers';

export interface NewEventInput {
  title: string;
  description: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  startsAt: Date;
  hostId: string;
  localImageUri: string | null;
}

/**
 * Uploads a local image (from camera or gallery) to Supabase Storage
 * and returns its public URL.
 *
 * We read the file as base64 and decode it to an ArrayBuffer rather than
 * using fetch()+blob() — blob uploads are unreliable in the React Native
 * environment, while this approach works consistently on iOS and Android.
 */
async function uploadEventImage(localUri: string, hostId: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const fileExt = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filePath = `${hostId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(COVER_IMAGES_BUCKET)
    .upload(filePath, decode(base64), {
      contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
    });

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(COVER_IMAGES_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Creates a new event. Uploads the cover image first (if provided),
 * then inserts the event row with the resulting image URL.
 */
export async function createEvent(input: NewEventInput): Promise<EventRow> {
  let coverImageUrl: string | null = null;

  if (input.localImageUri) {
    coverImageUrl = await uploadEventImage(input.localImageUri, input.hostId);
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      host_id: input.hostId,
      title: input.title,
      description: input.description || null,
      location_name: input.locationName || null,
      latitude: input.latitude,
      longitude: input.longitude,
      cover_image_url: coverImageUrl,
      starts_at: input.startsAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Fetches every event that has coordinates set, for the map view.
 * Unlike the paginated list, the map needs all pins at once — but we still
 * cap it at 200 so a very large table can't blow up the request.
 */
export async function fetchAllEventsForMap(): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

/**
 * Fetches one page of events, newest-starting-first, optionally filtered
 * by a search term matched against the title.
 *
 * Pagination pattern: Supabase's `.range(from, to)` is the equivalent of
 * SQL's LIMIT/OFFSET. We ask for one extra row past what we need so we
 * can tell whether there's a next page without a separate COUNT query.
 */
export async function fetchEventsPage(
  page: number,
  searchQuery: string
): Promise<EventsPage> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true })
    .range(from, to);

  if (searchQuery.trim().length > 0) {
    // ilike = case-insensitive LIKE. %term% matches anywhere in the title.
    query = query.ilike('title', `%${searchQuery.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const events = data ?? [];
  const hasNextPage = events.length === PAGE_SIZE;

  return {
    events,
    nextPage: hasNextPage ? page + 1 : null,
  };
}
