import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useIsOnline } from '@/hooks/useIsOnline';

export default function OfflineBanner() {
  const isOnline = useIsOnline();
  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>You're offline — showing saved events</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#f5a623',
    paddingVertical: 6,
    alignItems: 'center',
  },
  text: { color: '#111', fontSize: 12, fontWeight: '600' },
});
