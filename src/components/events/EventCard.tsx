import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import dayjs from 'dayjs';
import { EventRow } from '@/types/event';
import { useTheme } from '@/theme/ThemeContext';

interface Props {
  event: EventRow;
  onPress: (event: EventRow) => void;
  distanceLabel?: string | null;
}

// Every measurement here is deliberate and fixed (image height, body height)
// so the TOTAL card height is always exactly CARD_HEIGHT, no matter the
// content. That's what lets HomeScreen use FlatList's getItemLayout —
// which lets FlatList jump to any scroll position by math instead of by
// rendering and measuring everything up to that point. Without a fixed
// height, getItemLayout can't be used correctly.
const IMAGE_HEIGHT = 160;
const BODY_HEIGHT = 96;
export const CARD_HEIGHT = IMAGE_HEIGHT + BODY_HEIGHT; // 256
const CARD_VERTICAL_MARGIN = 8; // matches styles.card marginVertical
export const CARD_HEIGHT_WITH_MARGIN = CARD_HEIGHT + CARD_VERTICAL_MARGIN * 2;

// React.memo prevents this card from re-rendering when a sibling card's
// data changes but this one's props haven't — matters once the list has
// 100+ items, since without it, every scroll-triggered re-render of the
// list would re-render every mounted card, not just the ones that changed.
function EventCard({ event, onPress, distanceLabel }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          boxShadow: colors.card === '#ffffff' ? '0px 2px 8px rgba(0, 0, 0, 0.06)' : 'none',
        },
      ]}
      onPress={() => onPress(event)}
    >
      <Image
        source={{ uri: event.cover_image_url ?? 'https://placehold.co/400x240?text=Event' }}
        style={[styles.image, { backgroundColor: colors.border }]}
        contentFit="cover"
        transition={150}
        // recyclingKey tells expo-image "this is conceptually a different
        // image" when the FlatList recycles a card component for a new
        // item — without it, you can briefly see the PREVIOUS card's image
        // flash before the new one loads, since the underlying native view
        // gets reused.
        recyclingKey={event.id}
      />
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={[styles.meta, { color: colors.subtext }]}>
          {dayjs(event.starts_at).format('ddd, MMM D · h:mm A')}
        </Text>
        {/* Always render this line (even empty) so every card has the same
            number of text lines — part of keeping the height constant. */}
        <Text style={[styles.meta, { color: colors.subtext }]} numberOfLines={1}>
          {event.location_name ? `📍 ${event.location_name}` : ''}
          {distanceLabel ? `  ·  ${distanceLabel}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

export default React.memo(EventCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: CARD_VERTICAL_MARGIN,
    overflow: 'hidden',
  },
  image: { width: '100%', height: IMAGE_HEIGHT },
  body: { height: BODY_HEIGHT, padding: 12 },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  meta: { fontSize: 13, marginTop: 2 },
});
