export interface TravelCategory {
  id: string;
  label: string;
  description: string;
}

export interface DestinationSpotlight {
  id: string;
  title: string;
  country: string;
  tagline: string;
  imageUrl: string;
  bestFor: string;
}

export interface PlanningBoardItem {
  id: string;
  title: string;
  subtitle: string;
  status: 'booked' | 'draft' | 'saved';
  windowLabel: string;
}

export interface TravelerInsight {
  id: string;
  label: string;
  value: string;
}
