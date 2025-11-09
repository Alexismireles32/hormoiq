import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, ViewStyle } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = DesignSystem.radius.DEFAULT,
  style,
}: SkeletonLoaderProps) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [shimmerAnimation]);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View style={[styles.shimmer, { opacity }]} />
    </View>
  );
}

// Pre-built skeleton patterns
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonLoader width="60%" height={24} style={{ marginBottom: 12 }} />
      <SkeletonLoader width="100%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="80%" height={16} style={{ marginBottom: 16 }} />
      <View style={styles.row}>
        <SkeletonLoader width={80} height={40} borderRadius={DesignSystem.radius.lg} />
        <SkeletonLoader width={80} height={40} borderRadius={DesignSystem.radius.lg} />
      </View>
    </View>
  );
}

export function SkeletonScoreCard() {
  return (
    <View style={styles.scoreCard}>
      <View style={styles.scoreHeader}>
        <SkeletonLoader width={120} height={14} />
        <SkeletonLoader width={60} height={24} borderRadius={DesignSystem.radius.full} />
      </View>
      <View style={styles.scoreContent}>
        <SkeletonLoader
          width={120}
          height={120}
          borderRadius={DesignSystem.radius.full}
          style={{ alignSelf: 'center', marginVertical: 20 }}
        />
        <SkeletonLoader width="80%" height={16} style={{ alignSelf: 'center', marginBottom: 8 }} />
        <SkeletonLoader width="60%" height={14} style={{ alignSelf: 'center' }} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <SkeletonLoader width={40} height={40} borderRadius={DesignSystem.radius.md} />
          <View style={styles.listItemContent}>
            <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="40%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.neutral[200],
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: DesignSystem.colors.neutral[300],
  },
  card: {
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[6],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
  },
  scoreCard: {
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius['2xl'],
    padding: DesignSystem.spacing[8],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
    ...DesignSystem.shadows.sm,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing[4],
  },
  scoreContent: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: DesignSystem.spacing[3],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignSystem.spacing[4],
    gap: DesignSystem.spacing[3],
    backgroundColor: DesignSystem.colors.oura.cardBackground,
    borderRadius: DesignSystem.radius.lg,
    marginBottom: DesignSystem.spacing[2],
    borderWidth: 1,
    borderColor: DesignSystem.colors.oura.cardBorder,
  },
  listItemContent: {
    flex: 1,
  },
});

