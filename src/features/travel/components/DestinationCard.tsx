import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { TravelDestination } from '@/types/travel';

interface Props {
  destination: TravelDestination;
}

export default function DestinationCard({ destination }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: destination.imageUrl }} style={styles.image} contentFit="cover" transition={150} />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.country}>{destination.country}</Text>
        <Text style={styles.title}>{destination.title}</Text>
        <Text style={styles.tagline}>{destination.tagline}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{destination.bestFor}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    height: 340,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#172030',
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 14, 25, 0.34)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  country: {
    color: '#d7e4ff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
  },
  tagline: {
    color: '#eef4ff',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 16,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
});
