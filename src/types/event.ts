// Mirrors the `events` table created in supabase/schema.sql
export interface EventRow {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  starts_at: string; // ISO timestamp
  created_at: string;
}

export interface EventsPage {
  events: EventRow[];
  nextPage: number | null; // null means no more pages
}
