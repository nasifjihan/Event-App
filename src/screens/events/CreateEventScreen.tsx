import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { useCreateEvent } from '@/hooks/useCreateEvent';
import { HomeStackParamList, PickedLocation } from '@/navigation/HomeStackNavigator';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().max(500, 'Keep it under 500 characters').optional(),
  locationName: z.string().min(2, 'Add a location'),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEventScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, 'CreateEvent'>>();
  const { user } = useAuth();
  const createEventMutation = useCreateEvent();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState<Date>(dayjs().add(1, 'day').toDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: { title: '', description: '', locationName: '' },
  });

  // When we come back from PickLocationScreen, route.params.pickedLocation
  // will be set. We store the coordinates in state and push the resolved
  // name into the text field so the user sees it and can still edit it.
  useEffect(() => {
    if (route.params?.pickedLocation) {
      const location = route.params.pickedLocation;
      setPickedLocation(location);
      setValue('locationName', location.locationName);
    }
  }, [route.params?.pickedLocation]);

  // --- Image picking ---

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add a cover image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a cover photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // --- Date/time picking ---
  // Android shows native pickers as separate dialogs (no combined "datetime"
  // mode like iOS), so we do date first, then time, and merge them.

  const onDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // iOS picker stays inline; Android closes itself
    if (selectedDate) {
      const merged = dayjs(startsAt)
        .year(selectedDate.getFullYear())
        .month(selectedDate.getMonth())
        .date(selectedDate.getDate())
        .toDate();
      setStartsAt(merged);
    }
  };

  const onTimeChange = (_event: unknown, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const merged = dayjs(startsAt)
        .hour(selectedTime.getHours())
        .minute(selectedTime.getMinutes())
        .toDate();
      setStartsAt(merged);
    }
  };

  // --- Submit ---

  const onSubmit = async (formData: EventFormData) => {
    if (!user) return;

    try {
      await createEventMutation.mutateAsync({
        title: formData.title,
        description: formData.description ?? '',
        locationName: formData.locationName,
        latitude: pickedLocation?.latitude ?? null,
        longitude: pickedLocation?.longitude ?? null,
        startsAt,
        hostId: user.id,
        localImageUri: imageUri,
      });
      navigation.goBack();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      Alert.alert('Could not create event', message);
    }
  };

  const isSubmitting = createEventMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Cover image */}
        <Pressable style={styles.imagePicker} onPress={pickFromLibrary}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imagePickerText}>Tap to choose a cover image</Text>
          )}
        </Pressable>
        <View style={styles.imageButtonsRow}>
          <Pressable style={styles.smallButton} onPress={pickFromLibrary}>
            <Text style={styles.smallButtonText}>📷 Choose from Library</Text>
          </Pressable>
          <Pressable style={styles.smallButton} onPress={takePhoto}>
            <Text style={styles.smallButtonText}>📸 Take Photo</Text>
          </Pressable>
        </View>

        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="e.g. Sunset Beach Volleyball"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What should people know?"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
            />
          )}
        />
        {errors.description && <Text style={styles.error}>{errors.description.message}</Text>}

        {/* Location */}
        <Text style={styles.label}>Location</Text>
        <Controller
          control={control}
          name="locationName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="e.g. Ocean Beach"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.locationName && <Text style={styles.error}>{errors.locationName.message}</Text>}
        <Pressable
          style={styles.mapPickButton}
          onPress={() => navigation.navigate('PickLocation')}
        >
          <Text style={styles.mapPickButtonText}>
            {pickedLocation ? '📍 Location set on map — tap to change' : '🗺️ Pick precise location on map'}
          </Text>
        </Pressable>

        {/* Date & time */}
        <Text style={styles.label}>When</Text>
        <View style={styles.dateRow}>
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{dayjs(startsAt).format('ddd, MMM D, YYYY')}</Text>
          </Pressable>
          <Pressable style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.dateButtonText}>{dayjs(startsAt).format('h:mm A')}</Text>
          </Pressable>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={startsAt}
            mode="date"
            minimumDate={new Date()}
            onChange={onDateChange}
          />
        )}
        {showTimePicker && (
          <DateTimePicker value={startsAt} mode="time" onChange={onTimeChange} />
        )}

        {/* Submit */}
        <Pressable
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Creating event...' : 'Create Event'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  imagePicker: {
    height: 160,
    borderRadius: 14,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePickerText: { color: '#888' },
  imageButtonsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  smallButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  smallButtonText: { fontSize: 13, fontWeight: '500' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  error: { color: '#e53e3e', fontSize: 13, marginTop: 4 },
  hint: { color: '#999', fontSize: 12, marginTop: 6 },
  mapPickButton: {
    marginTop: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  mapPickButtonText: { fontSize: 13, fontWeight: '500' },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dateButtonText: { fontSize: 14, fontWeight: '500' },
  submitButton: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
