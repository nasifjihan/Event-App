import {
  DestinationSpotlight,
  PlanningBoardItem,
  TravelCategory,
  TravelerInsight,
} from '@/features/travel/types';

export const travelCategories: TravelCategory[] = [
  {
    id: 'coastal',
    label: 'Coastal',
    description: 'Beach escapes, island stays, and sunset experiences.',
  },
  {
    id: 'city',
    label: 'City Breaks',
    description: 'Culture-first trips with food, nightlife, and landmarks.',
  },
  {
    id: 'wellness',
    label: 'Wellness',
    description: 'Recharge with quiet stays, spas, and nature routines.',
  },
  {
    id: 'adventure',
    label: 'Adventure',
    description: 'Active itineraries with hikes, tours, and local guides.',
  },
];

export const destinationSpotlights: DestinationSpotlight[] = [
  {
    id: 'bali',
    title: 'Bali Escape',
    country: 'Indonesia',
    tagline: 'Slow mornings, surf towns, and curated wellness stays.',
    imageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20tropical%20travel%20destination%20with%20infinity%20pool%2C%20palm%20trees%2C%20warm%20sunset%2C%20cinematic%20resort%20photography%2C%20realistic%2C%20premium%20editorial%20travel%20magazine%20style&image_size=landscape_16_9',
    bestFor: 'Wellness retreats',
  },
  {
    id: 'dubai',
    title: 'Dubai Signature',
    country: 'United Arab Emirates',
    tagline: 'Premium stays, skyline dining, and desert-to-city itineraries.',
    imageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern%20luxury%20travel%20destination%20city%20skyline%20with%20high-end%20hotel%20terrace%2C%20golden%20hour%2C%20realistic%20architectural%20travel%20photography%2C%20premium%20editorial%20style&image_size=landscape_16_9',
    bestFor: 'Luxury city breaks',
  },
  {
    id: 'swiss-alps',
    title: 'Alpine Route',
    country: 'Switzerland',
    tagline: 'Scenic rail days, mountain lodges, and quiet panoramic stops.',
    imageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=majestic%20swiss%20alps%20travel%20destination%20with%20mountain%20lodge%2C%20clean%20lake%2C%20morning%20light%2C%20realistic%20premium%20travel%20photography%2C%20editorial%20quality&image_size=landscape_16_9',
    bestFor: 'Scenic nature itineraries',
  },
];

export const planningBoardItems: PlanningBoardItem[] = [
  {
    id: '1',
    title: 'Istanbul Long Weekend',
    subtitle: 'Boutique hotel, Bosphorus dinner, and old city walking route.',
    status: 'booked',
    windowLabel: 'Aug 12 - Aug 15',
  },
  {
    id: '2',
    title: 'Cappadocia Sunrise Plan',
    subtitle: 'Hot air balloon shortlist, cave suite, and photo spots.',
    status: 'draft',
    windowLabel: 'Planning for September',
  },
  {
    id: '3',
    title: 'Maldives Saveboard',
    subtitle: 'Resort shortlist, transfer notes, and honeymoon ideas.',
    status: 'saved',
    windowLabel: 'Dream trip',
  },
];

export const travelerInsights: TravelerInsight[] = [
  { id: 'countries', label: 'Destinations saved', value: '18' },
  { id: 'upcoming', label: 'Upcoming plans', value: '3' },
  { id: 'passport', label: 'Travel style', value: 'Luxury + Local' },
];
