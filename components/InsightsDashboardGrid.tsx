import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';

interface GridItem {
  id: string;
  component: React.ReactNode;
  span?: 1 | 2; // How many columns to span (1 = half width, 2 = full width)
}

interface InsightsDashboardGridProps {
  items: GridItem[];
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  columnGap?: number;
  rowGap?: number;
}

export function InsightsDashboardGrid({
  items,
  onRefresh,
  refreshing = false,
  columnGap = DesignSystem.spacing[4],
  rowGap = DesignSystem.spacing[4],
}: InsightsDashboardGridProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const itemAnimations = useRef<{ [key: string]: Animated.Value }>({});

  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = DesignSystem.spacing[6] * 2; // Both sides
  const availableWidth = screenWidth - horizontalPadding - columnGap;
  const singleColumnWidth = availableWidth / 2;

  useEffect(() => {
    // Initialize animations for each item with staggered delays
    items.forEach((item, index) => {
      if (!itemAnimations.current[item.id]) {
        const anim = new Animated.Value(0);
        itemAnimations.current[item.id] = anim;

        // Staggered entrance animation
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          delay: index * 100, // 100ms stagger between items
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    });
  }, [items]);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderGrid = () => {
    const rows: GridItem[][] = [];
    let currentRow: GridItem[] = [];
    let currentRowWidth = 0;

    items.forEach((item) => {
      const itemSpan = item.span || 1;
      const itemWidth = itemSpan === 2 ? 2 : 1;

      // If adding this item exceeds row width, start a new row
      if (currentRowWidth + itemWidth > 2) {
        rows.push(currentRow);
        currentRow = [item];
        currentRowWidth = itemWidth;
      } else {
        currentRow.push(item);
        currentRowWidth += itemWidth;
      }
    });

    // Add the last row if it has items
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows.map((row, rowIndex) => (
      <View key={`row-${rowIndex}`} style={[styles.row, { marginBottom: rowGap }]}>
        {row.map((item, itemIndex) => {
          const itemSpan = item.span || 1;
          const itemWidth = itemSpan === 2 ? '100%' : singleColumnWidth;
          const animation = itemAnimations.current[item.id] || new Animated.Value(1);

          return (
            <Animated.View
              key={item.id}
              style={[
                styles.gridItem,
                {
                  width: itemWidth,
                  marginRight: itemIndex < row.length - 1 ? columnGap : 0,
                  opacity: animation,
                  transform: [
                    {
                      translateY: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                    {
                      scale: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {item.component}
            </Animated.View>
          );
        })}
      </View>
    ));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing || refreshing}
            onRefresh={handleRefresh}
            tintColor={DesignSystem.colors.primary[500]}
            colors={[DesignSystem.colors.primary[500]]}
          />
        ) : undefined
      }
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {renderGrid()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: DesignSystem.spacing[6],
    paddingVertical: DesignSystem.spacing[4],
    paddingBottom: DesignSystem.spacing[24], // Extra space for FAB
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  gridItem: {
    // Width is set dynamically
  },
});

