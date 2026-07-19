import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ManageStackParamList } from '@/navigation/ManageStackNavigator';
import { useTheme } from '@/theme/ThemeContext';
import { useProviderProfile } from '@/hooks/useProviderProfile';

export default function ProviderOnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ManageStackParamList>>();
  const { colors } = useTheme();
  const { profile, submitOnboarding, isSubmitting } = useProviderProfile();

  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!profile) return;
    setBusinessName(profile.businessName);
    setContactEmail(profile.contactEmail ?? '');
    setPortfolioUrl(profile.portfolioUrl ?? '');
    setNotes(profile.notes ?? '');
  }, [profile]);

  const handleSubmit = async () => {
    if (businessName.trim().length < 2) {
      Alert.alert('Business name required', 'Add the provider or business name before submitting.');
      return;
    }

    try {
      await submitOnboarding({
        businessName: businessName.trim(),
        contactEmail: contactEmail.trim(),
        portfolioUrl: portfolioUrl.trim(),
        notes: notes.trim(),
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Could not submit onboarding',
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>Provider onboarding</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          Submit the business profile that admin reviewers use to approve provider access and publishing privileges.
        </Text>

        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statusLabel, { color: colors.subtext }]}>Current status</Text>
          <Text style={[styles.statusValue, { color: colors.text }]}>
            {profile?.approvalStatus?.replace('_', ' ') ?? 'not started'}
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Business name</Text>
        <TextInput
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="Example: Atlas Premium Journeys"
          placeholderTextColor={colors.subtext}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Contact email</Text>
        <TextInput
          value={contactEmail}
          onChangeText={setContactEmail}
          placeholder="team@provider.com"
          placeholderTextColor={colors.subtext}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Portfolio URL</Text>
        <TextInput
          value={portfolioUrl}
          onChangeText={setPortfolioUrl}
          placeholder="https://yourportfolio.com"
          placeholderTextColor={colors.subtext}
          autoCapitalize="none"
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Describe your destinations, experience standards, and operating model."
          placeholderTextColor={colors.subtext}
          multiline
          numberOfLines={5}
          style={[
            styles.input,
            styles.textArea,
            { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
          ]}
        />

        <Pressable
          style={[styles.button, { backgroundColor: colors.text }, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            {isSubmitting ? 'Submitting...' : 'Submit for review'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 28, lineHeight: 36, fontWeight: '800' },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 10 },
  statusCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginTop: 24,
  },
  statusLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  statusValue: { fontSize: 20, fontWeight: '800', marginTop: 10 },
  label: { fontSize: 14, fontWeight: '700', marginTop: 22, marginBottom: 8 },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  button: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { fontSize: 15, fontWeight: '700' },
});
