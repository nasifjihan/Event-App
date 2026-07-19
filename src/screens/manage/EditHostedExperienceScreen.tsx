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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { ManageStackParamList } from '@/navigation/ManageStackNavigator';
import { useUpdateTravelExperience } from '@/hooks/useUpdateTravelExperience';

export default function EditHostedExperienceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ManageStackParamList>>();
  const route = useRoute<RouteProp<ManageStackParamList, 'EditHostedExperience'>>();
  const { colors } = useTheme();
  const updateMutation = useUpdateTravelExperience();
  const { experience } = route.params;

  const [title, setTitle] = useState(experience.title);
  const [description, setDescription] = useState(experience.summary || experience.description || '');
  const [locationName, setLocationName] = useState(experience.location_name || '');
  const [imageUri, setImageUri] = useState<string | null>(experience.cover_image_url);
  const [startsAt, setStartsAt] = useState<Date>(new Date(experience.starts_at));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow library access to update the cover image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (experience.source !== 'experience') {
      Alert.alert(
        'Migration required',
        'Legacy events should be migrated into native travel experiences before editing.'
      );
      return;
    }

    if (title.trim().length < 3) {
      Alert.alert('Title required', 'Add a title with at least 3 characters.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        experienceId: experience.id,
        title: title.trim(),
        description: description.trim(),
        locationName: locationName.trim(),
        startsAt,
        localImageUri: imageUri,
        existingImageUrl: experience.cover_image_url,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Could not save changes',
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
        <Text style={[styles.title, { color: colors.text }]}>Edit hosted experience</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          Native travel inventory can now be updated directly from the provider dashboard.
        </Text>

        <Pressable
          style={[styles.coverShell, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={chooseImage}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.coverImage} contentFit="cover" />
          ) : (
            <Text style={[styles.placeholderText, { color: colors.subtext }]}>Choose a cover image</Text>
          )}
        </Pressable>

        <Text style={[styles.label, { color: colors.text }]}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Experience title"
          placeholderTextColor={colors.subtext}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Overview</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Update the summary or guest-facing description."
          placeholderTextColor={colors.subtext}
          multiline
          numberOfLines={5}
          style={[
            styles.input,
            styles.textArea,
            { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
          ]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Meeting point</Text>
        <TextInput
          value={locationName}
          onChangeText={setLocationName}
          placeholder="Meeting point or destination"
          placeholderTextColor={colors.subtext}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Schedule</Text>
        <Pressable
          style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateText, { color: colors.text }]}>{dayjs(startsAt).format('ddd, MMM D, YYYY')}</Text>
        </Pressable>
        <Pressable
          style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={[styles.dateText, { color: colors.text }]}>{dayjs(startsAt).format('h:mm A')}</Text>
        </Pressable>

        {showDatePicker ? (
          <DateTimePicker
            value={startsAt}
            mode="date"
            onChange={(_event, value) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (value) {
                setStartsAt((previous) =>
                  dayjs(previous)
                    .year(value.getFullYear())
                    .month(value.getMonth())
                    .date(value.getDate())
                    .toDate()
                );
              }
            }}
          />
        ) : null}
        {showTimePicker ? (
          <DateTimePicker
            value={startsAt}
            mode="time"
            onChange={(_event, value) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (value) {
                setStartsAt((previous) =>
                  dayjs(previous)
                    .hour(value.getHours())
                    .minute(value.getMinutes())
                    .toDate()
                );
              }
            }}
          />
        ) : null}

        <Pressable
          style={[
            styles.primaryButton,
            { backgroundColor: colors.text },
            updateMutation.isPending && styles.primaryButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={updateMutation.isPending}
        >
          <Text style={[styles.primaryButtonText, { color: colors.background }]}>
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
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
  coverShell: {
    marginTop: 24,
    borderRadius: 24,
    borderWidth: 1,
    height: 220,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: { ...StyleSheet.absoluteFill },
  placeholderText: { fontSize: 14, fontWeight: '600' },
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
  dateButton: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 30,
  },
  primaryButtonDisabled: { opacity: 0.65 },
  primaryButtonText: { fontSize: 15, fontWeight: '700' },
});
