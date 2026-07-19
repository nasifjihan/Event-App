import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import DestinationCard from '@/features/travel/components/DestinationCard';

jest.mock('expo-image', () => ({
  Image: 'ExpoImage',
}));

const destination = {
  id: 'bali',
  title: 'Bali Escape',
  country: 'Indonesia',
  tagline: 'Slow mornings, surf towns, and curated wellness stays.',
  imageUrl:
    'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=bali&image_size=landscape_16_9',
  bestFor: 'Wellness retreats',
};

describe('DestinationCard', () => {
  it('renders travel destination copy', () => {
    let tree;

    act(() => {
      tree = renderer.create(<DestinationCard destination={destination} />);
    });

    const texts = tree.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toEqual(
      expect.arrayContaining([
        destination.country,
        destination.title,
        destination.tagline,
        destination.bestFor,
      ])
    );
  });

  it('calls onPress when the card is tapped', () => {
    const onPress = jest.fn();
    let tree;

    act(() => {
      tree = renderer.create(<DestinationCard destination={destination} onPress={onPress} />);
    });

    act(() => {
      const pressableNode = tree.root.find((node) => typeof node.props?.onPress === 'function');
      pressableNode.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
