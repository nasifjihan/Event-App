export type TravelExperienceSource = 'experience' | 'legacy_event';

export interface TravelExperience {
  id: string;
  source: TravelExperienceSource;
  host_id: string;
  title: string;
  description: string | null;
  summary: string | null;
  cover_image_url: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  starts_at: string;
  created_at: string;
  status: string;
  price_amount: number | null;
  currency: string | null;
  duration_minutes: number | null;
  capacity: number | null;
}

export interface TravelExperiencesPage {
  experiences: TravelExperience[];
  nextPage: number | null;
}

export interface TravelDestination {
  id: string;
  title: string;
  country: string;
  tagline: string;
  imageUrl: string;
  bestFor: string;
}

export interface TravelTripPlan {
  id: string;
  title: string;
  subtitle: string;
  status: 'booked' | 'draft' | 'saved';
  windowLabel: string;
}

export interface TravelReservationStatus {
  count: number;
  isReserved: boolean;
}

export interface TravelBookingHistoryItem {
  id: string;
  experienceId: string;
  title: string;
  bookingStatus: string;
  bookedAt: string;
  startsAt: string | null;
  locationName: string | null;
  travelersCount: number;
  totalAmount: number | null;
  currency: string | null;
}

export interface TravelProviderBooking {
  id: string;
  experienceId: string;
  experienceTitle: string;
  travelerLabel: string;
  bookingStatus: string;
  bookedAt: string;
  startsAt: string | null;
  travelersCount: number;
  totalAmount: number | null;
  currency: string | null;
}

export interface TravelOperationsSummary {
  liveExperiences: number;
  draftExperiences: number;
  nativeExperiences: number;
  legacyExperiences: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  projectedRevenue: number;
  currency: string;
}

export interface TravelNotificationPreferences {
  bookingConfirmations: boolean;
  tripReminders: boolean;
  promotions: boolean;
  providerAlerts: boolean;
}

export interface TravelProviderProfile {
  userId: string;
  businessName: string;
  contactEmail: string | null;
  portfolioUrl: string | null;
  notes: string | null;
  approvalStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  reviewedAt: string | null;
}

export interface TravelModerationItem {
  id: string;
  title: string;
  entityType: 'experience' | 'provider';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  submittedByLabel: string;
  notes: string | null;
}

export interface TravelAnalyticsSnapshot {
  id: string;
  capturedAt: string;
  liveExperiences: number;
  pendingBookings: number;
  confirmedBookings: number;
  projectedRevenue: number;
  currency: string;
}
