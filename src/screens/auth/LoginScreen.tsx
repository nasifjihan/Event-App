import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '@/config/supabase';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { useTheme } from '@/theme/ThemeContext';

// Schema defines both the shape AND the validation rules for the form.
// react-hook-form + zod is the standard pairing in production RN apps.
const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors, isDark } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Sign-in failed', error.message);
      return;
    }
    // No manual navigation needed — RootNavigator watches the session
    // and will automatically swap to the main app tabs.
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.shell}>
          <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View
              style={[
                styles.heroGlowLarge,
                { backgroundColor: colors.primary, opacity: isDark ? 0.18 : 0.1 },
              ]}
            />
            <View
              style={[
                styles.heroGlowSmall,
                { backgroundColor: colors.primary, opacity: isDark ? 0.12 : 0.08 },
              ]}
            />
            <Text style={[styles.eyebrow, { color: colors.subtext }]}>Voyageo Travel</Text>
            <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
              Sign in to manage saved escapes, reservations, and hosted experiences from one premium workspace.
            </Text>

            <View style={styles.pillRow}>
              {['Saved stays', 'Live bookings', 'Provider tools'].map((item) => (
                <View
                  key={item}
                  style={[styles.heroPill, { backgroundColor: colors.background, borderColor: colors.border }]}
                >
                  <Text style={[styles.heroPillText, { color: colors.text }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.formHeader}>
              <Text style={[styles.formEyebrow, { color: colors.subtext }]}>Secure access</Text>
              <Text style={[styles.formTitle, { color: colors.text }]}>Sign in</Text>
              <Text style={[styles.formSubtitle, { color: colors.subtext }]}>
                Use your email account to continue into the travel dashboard.
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: colors.inputBackground,
                        borderColor: errors.email ? colors.danger : colors.border,
                      },
                    ]}
                    placeholder="you@voyageo.com"
                    placeholderTextColor={colors.subtext}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.email && <Text style={[styles.error, { color: colors.danger }]}>{errors.email.message}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: colors.inputBackground,
                        borderColor: errors.password ? colors.danger : colors.border,
                      },
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.subtext}
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.password && (
                <Text style={[styles.error, { color: colors.danger }]}>{errors.password.message}</Text>
              )}
            </View>

            <Pressable
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                {isSubmitting ? 'Signing in...' : 'Enter dashboard'}
              </Text>
            </Pressable>

            <View style={[styles.infoRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Traveler note</Text>
              <Text style={[styles.infoText, { color: colors.subtext }]}>
                Your session automatically opens the app tabs as soon as authentication succeeds.
              </Text>
            </View>

            <Pressable style={styles.secondaryAction} onPress={() => navigation.navigate('Signup')}>
              <Text style={[styles.secondaryPrefix, { color: colors.subtext }]}>New to Voyageo?</Text>
              <Text style={[styles.secondaryLink, { color: colors.text }]}> Create your account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  shell: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
    gap: 18,
  },
  heroCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 24,
  },
  heroGlowLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    top: -120,
    right: -20,
  },
  heroGlowSmall: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 999,
    bottom: -56,
    left: -36,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  heroPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
  },
  formHeader: {
    marginBottom: 16,
  },
  formEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  formSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  fieldGroup: {
    marginTop: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  error: {
    fontSize: 13,
    marginTop: 7,
    lineHeight: 18,
  },
  button: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  infoRow: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 14,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  secondaryAction: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    flexWrap: 'wrap',
  },
  secondaryPrefix: {
    fontSize: 14,
  },
  secondaryLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
