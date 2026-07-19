import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { TravelStackParamList } from '@/navigation/TravelStackNavigator';
import { useTheme } from '@/theme/ThemeContext';
import { useDestinationDetail } from '@/hooks/useDestinationDetail';

export default function DestinationDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TravelStackParamList>>();
  const route = useRoute<RouteProp<TravelStackParamList, 'DestinationDetail'>>();
  const { colors } = useTheme();
  const { data: destination, isLoading, isError, error } = useDestinationDetail(route.params.destinationId);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (isError || !destination) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Destination unavailable</Text>
        <Text style={[styles.errorBody, { color: colors.subtext }]}>
          {error instanceof Error ? error.message : 'Please return and try again.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroShell}>
          <Image source={{ uri: destination.imageUrl }} style={styles.heroImage} contentFit="cover" transition={160} />
          <View style={styles.heroOverlay} />
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.heroContent}>
            <Text style={styles.country}>{destination.country}</Text>
            <Text style={styles.title}>{destination.title}</Text>
            <Text style={styles.tagline}>{destination.tagline}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Why this destination matters</Text>
            <Text style={[styles.infoBody, { color: colors.subtext }]}>
              Destination detail pages let you merchandise the place itself, not just individual experiences. This is where travel storytelling, itinerary hooks, and future booking funnels come together.
            </Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Best for</Text>
            <Text style={[styles.infoBody, { color: colors.subtext }]}>{destination.bestFor}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  errorBody: {
    fontSize: 14,
    marginTop: 10,
    lineHeight: 22,
    textAlign: 'center',
  },
  heroShell: {
    height: 400,
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 15, 24, 0.38)',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(8, 12, 18, 0.42)',
  },
  backText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 26,
  },
  country: {
    color: '#d7e4ff',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  title: {
    color: '#fff',
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    marginTop: 10,
  },
  tagline: {
    color: '#edf4ff',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  body: {
    padding: 20,
    gap: 16,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoBody: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
});
