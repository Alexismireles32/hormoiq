import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - (DesignSystem.spacing[6] * 2); // Full width minus horizontal padding
const CARD_SPACING = DesignSystem.spacing[4];

interface SwipeableScoreCardsProps {
  children: React.ReactNode[];
}

export function SwipeableScoreCards({ children }: SwipeableScoreCardsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {React.Children.map(children, (child, index) => (
          <View
            key={index}
            style={[
              styles.cardWrapper,
              index === 0 && styles.firstCard,
              index === children.length - 1 && styles.lastCard,
            ]}
          >
            {child}
          </View>
        ))}
      </ScrollView>

      {/* Page Indicators */}
      <View style={styles.indicatorContainer}>
        {React.Children.map(children, (_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === activeIndex && styles.indicatorActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignSystem.spacing[6],
  },
  scrollContent: {
    paddingHorizontal: DesignSystem.spacing[2],
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  firstCard: {
    marginLeft: DesignSystem.spacing[4],
  },
  lastCard: {
    marginRight: DesignSystem.spacing[6],
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: DesignSystem.spacing[4],
    gap: DesignSystem.spacing[2],
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.neutral[300],
  },
  indicatorActive: {
    width: 8,
    height: 8,
    backgroundColor: DesignSystem.colors.primary[500],
  },
});

