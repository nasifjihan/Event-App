import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  searchQuery: string;
}

export default function EmptyEventsState({ searchQuery }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🗓️</Text>
      <Text style={styles.title}>
        {searchQuery ? 'No events match your search' : 'No events yet'}
      </Text>
      <Text style={styles.subtitle}>
        {searchQuery
          ? 'Try a different search term.'
          : 'Be the first to create one using the + button below.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emoji: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#777', textAlign: 'center' },
});
