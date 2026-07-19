import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { TravelCategory } from '@/features/travel/types';
import { useTheme } from '@/theme/ThemeContext';

interface Props {
  category: TravelCategory;
  isActive: boolean;
  onPress: () => void;
}

export default function CategoryChip({ category, isActive, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: isActive ? colors.text : colors.card,
          borderColor: isActive ? colors.text : colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: isActive ? colors.background : colors.text }]}>
        {category.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
