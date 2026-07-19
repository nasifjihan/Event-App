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
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useCreateEvent } from '@/hooks/useCreateEvent';
import { PickedLocation, TravelStackParamList } from '@/navigation/TravelStackNavigator';
import { useTheme } from '@/theme/ThemeContext';

const experienceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().max(500, 'Keep the overview under 500 characters').optional(),
  locationName: z.string().min(2, 'Add a destination or meeting point'),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

export default function CreateExperienceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TravelStackParamList>>();
  const route = useRoute<RouteProp<TravelStackParamList, 'CreateExperience'>>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const createEventMutation = useCreateEvent();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState<Date>(dayjs().add(7, 'day').hour(10).minute(0).toDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: '',
      description: '',
      locationName: '',
    },
  });

  useEffect(() => {
    if (route.params?.pickedLocation) {
      setPickedLocation(route.params.pickedLocation);
      setValue('locationName', route.params.pickedLocation.locationName);
    }
  }, [route.params?.pickedLocation, setValue]);

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow library access to add a travel cover image.');
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

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to capture a cover image.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartsAt((previous) =>
        dayjs(previous)
          .year(selectedDate.getFullYear())
          .month(selectedDate.getMonth())
          .date(selectedDate.getDate())
          .toDate()
      );
    }
  };

  const onTimeChange = (_event: unknown, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setStartsAt((previous) =>
        dayjs(previous)
          .hour(selectedTime.getHours())
          .minute(selectedTime.getMinutes())
          .toDate()
      );
    }
  };

  const onSubmit = async (formData: ExperienceFormData) => {
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
    } catch (error) {
      Alert.alert(
        'Could not publish experience',
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    }
  };

  const isSubmitting = createEventMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>Create a premium travel experience</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          Publish a destination-led activity, retreat, route, or hosted local experience with stronger presentation.
        </Text>

        <Pressable
          style={[styles.coverShell, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={pickFromLibrary}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.coverImage} contentFit="cover" />
          ) : (
            <View>
              <Text style={[styles.coverTitle, { color: colors.text }]}>Add a hero cover</Text>
              <Text style={[styles.coverBody, { color: colors.subtext }]}>
                Use a strong travel image so the experience feels curated and premium in the feed.
              </Text>
            </View>
          )}
        </Pressable>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={pickFromLibrary}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Choose from library</Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={takePhoto}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Take photo</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Title</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Example: Desert Dinner And Stargazing"
              placeholderTextColor={colors.subtext}
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.title ? <Text style={[styles.error, { color: colors.danger }]}>{errors.title.message}</Text> : null}

        <Text style={[styles.label, { color: colors.text }]}>Overview</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
              ]}
              placeholder="Describe the route, audience, pace, and key highlights."
              placeholderTextColor={colors.subtext}
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={5}
            />
          )}
        />
        {errors.description ? (
          <Text style={[styles.error, { color: colors.danger }]}>{errors.description.message}</Text>
        ) : null}

        <Text style={[styles.label, { color: colors.text }]}>Destination or meeting point</Text>
        <Controller
          control={control}
          name="locationName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Example: Jumeirah Beach, Dubai"
              placeholderTextColor={colors.subtext}
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.locationName ? (
          <Text style={[styles.error, { color: colors.danger }]}>{errors.locationName.message}</Text>
        ) : null}

        <Pressable
          style={[styles.mapButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('PickExperienceLocation')}
        >
          <Text style={[styles.mapButtonText, { color: colors.text }]}>
            {pickedLocation ? 'Location pinned on map' : 'Pick exact map location'}
          </Text>
        </Pressable>

        <Text style={[styles.label, { color: colors.text }]}>When it goes live</Text>
        <View style={styles.dateRow}>
          <Pressable
            style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateButtonText, { color: colors.text }]}>
              {dayjs(startsAt).format('ddd, MMM D, YYYY')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={[styles.dateButtonText, { color: colors.text }]}>
              {dayjs(startsAt).format('h:mm A')}
            </Text>
          </Pressable>
        </View>

        {showDatePicker ? (
          <DateTimePicker value={startsAt} mode="date" minimumDate={new Date()} onChange={onDateChange} />
        ) : null}
        {showTimePicker ? (
          <DateTimePicker value={startsAt} mode="time" onChange={onTimeChange} />
        ) : null}

        <Pressable
          style={[
            styles.publishButton,
            { backgroundColor: colors.text },
            isSubmitting && styles.publishButtonDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={[styles.publishButtonText, { color: colors.background }]}>
            {isSubmitting ? 'Publishing...' : 'Publish experience'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  coverShell: {
    marginTop: 24,
    borderRadius: 24,
    borderWidth: 1,
    height: 220,
    padding: 20,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverImage: {
    ...StyleSheet.absoluteFill,
  },
  coverTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  coverBody: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 420,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 8,
  },
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
  error: {
    fontSize: 13,
    marginTop: 6,
  },
  mapButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateRow: {
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
  dateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  publishButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 30,
  },
  publishButtonDisabled: {
    opacity: 0.65,
  },
  publishButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
