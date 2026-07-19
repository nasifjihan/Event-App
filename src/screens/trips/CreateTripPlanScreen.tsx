import React, { useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { TripsStackParamList } from '@/navigation/TripsStackNavigator';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTripPlan } from '@/hooks/useCreateTripPlan';

export default function CreateTripPlanScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TripsStackParamList>>();
  const route = useRoute<RouteProp<TripsStackParamList, 'CreateTripPlan'>>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const createTripPlanMutation = useCreateTripPlan();

  const [title, setTitle] = useState(route.params?.prefillTitle ?? '');
  const [notes, setNotes] = useState(route.params?.prefillNotes ?? '');
  const [startDate, setStartDate] = useState<Date>(dayjs().add(14, 'day').toDate());
  const [endDate, setEndDate] = useState<Date>(dayjs().add(18, 'day').toDate());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    if (title.trim().length < 3) {
      Alert.alert('Trip title required', 'Add a trip plan title with at least 3 characters.');
      return;
    }

    try {
      await createTripPlanMutation.mutateAsync({
        userId: user.id,
        title: title.trim(),
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        endDate: dayjs(endDate).format('YYYY-MM-DD'),
        notes: notes.trim(),
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Could not create trip plan',
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
        <Text style={[styles.title, { color: colors.text }]}>Create trip plan</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          Turn saved inspiration or a confirmed reservation into an itinerary shell you can build on later.
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Plan title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Example: Bali Wellness Week"
          placeholderTextColor={colors.subtext}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Planning notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="High-level goals, favorite experiences, hotel ideas, or route notes."
          placeholderTextColor={colors.subtext}
          multiline
          numberOfLines={5}
          style={[
            styles.input,
            styles.textArea,
            { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
          ]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Travel window</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={[styles.dateText, { color: colors.text }]}>{dayjs(startDate).format('MMM D, YYYY')}</Text>
          </Pressable>
          <Pressable
            style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={[styles.dateText, { color: colors.text }]}>{dayjs(endDate).format('MMM D, YYYY')}</Text>
          </Pressable>
        </View>

        {showStartPicker ? (
          <DateTimePicker
            value={startDate}
            mode="date"
            minimumDate={new Date()}
            onChange={(_event, value) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (value) setStartDate(value);
            }}
          />
        ) : null}
        {showEndPicker ? (
          <DateTimePicker
            value={endDate}
            mode="date"
            minimumDate={startDate}
            onChange={(_event, value) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (value) setEndDate(value);
            }}
          />
        ) : null}

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>What Phase 4 adds</Text>
          <Text style={[styles.infoBody, { color: colors.subtext }]}>
            Trip plans are now creatable from the app UI, which turns the planning board into a working flow rather than just a reporting surface.
          </Text>
        </View>

        <Pressable
          style={[
            styles.primaryButton,
            { backgroundColor: colors.text },
            createTripPlanMutation.isPending && styles.primaryButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createTripPlanMutation.isPending}
        >
          <Text style={[styles.primaryButtonText, { color: colors.background }]}>
            {createTripPlanMutation.isPending ? 'Creating...' : 'Create plan'}
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
  label: { fontSize: 14, fontWeight: '700', marginTop: 22, marginBottom: 8 },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginTop: 24,
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
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
  },
  primaryButtonDisabled: { opacity: 0.65 },
  primaryButtonText: { fontSize: 15, fontWeight: '700' },
});
