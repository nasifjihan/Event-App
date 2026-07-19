import {
  destinationSpotlights,
  planningBoardItems,
  travelCategories,
  travelerInsights,
} from '@/features/travel/data/travelCollections';

describe('travelCollections', () => {
  it('keeps unique ids across curated collections', () => {
    const groups = [travelCategories, destinationSpotlights, planningBoardItems, travelerInsights];

    groups.forEach((group) => {
      const ids = group.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  it('uses allowed generated-image URLs for destination spotlights', () => {
    destinationSpotlights.forEach((destination) => {
      expect(destination.imageUrl).toContain(
        'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt='
      );
      expect(destination.imageUrl).toContain('image_size=');
    });
  });

  it('only uses supported planning statuses', () => {
    const validStatuses = new Set(['booked', 'draft', 'saved']);

    planningBoardItems.forEach((plan) => {
      expect(validStatuses.has(plan.status)).toBe(true);
    });
  });
});
