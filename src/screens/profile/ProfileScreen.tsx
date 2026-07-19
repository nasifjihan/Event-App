import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // RootNavigator watches the session and will swap back to Auth automatically.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.text}>👤 Profile details coming in a later phase</Text>
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  email: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  text: { fontSize: 14, color: '#666', marginBottom: 24 },
  button: {
    backgroundColor: '#e53e3e',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
