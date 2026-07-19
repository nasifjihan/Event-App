import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import dayjs from 'dayjs';
import { useTheme } from '@/theme/ThemeContext';
import { TravelExperience } from '@/types/travel';

interface Props {
  experience: TravelExperience;
  descriptor: string;
  onPress: () => void;
}

export default function ExperienceCard({ experience, descriptor, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <Image
        source={{
          uri:
            experience.cover_image_url ??
            'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=premium%20travel%20experience%20card%20cover%20with%20beautiful%20destination%2C%20realistic%20editorial%20tourism%20photography&image_size=landscape_16_9',
        }}
        style={[styles.image, { backgroundColor: colors.border }]}
        contentFit="cover"
        transition={150}
        recyclingKey={experience.id}
      />
      <View style={styles.body}>
        <Text style={[styles.eyebrow, { color: colors.subtext }]}>{descriptor}</Text>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {experience.title}
        </Text>
        <Text style={[styles.meta, { color: colors.subtext }]} numberOfLines={1}>
          {experience.location_name || 'Flexible destination'} · {dayjs(experience.starts_at).format('MMM D')}
          {experience.price_amount != null ? ` · ${experience.currency ?? 'USD'} ${experience.price_amount}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    marginRight: 14,
  },
  image: {
    width: '100%',
    height: 160,
  },
  body: {
    padding: 14,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  meta: {
    fontSize: 13,
    marginTop: 10,
  },
});
