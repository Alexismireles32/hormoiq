import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = DesignSystem.radius.DEFAULT,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: width as any,
          height,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={[
            DesignSystem.colors.neutral[100],
            DesignSystem.colors.neutral[200],
            DesignSystem.colors.neutral[100],
          ] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.neutral[100],
  },
});

// Preset skeleton components
export const SkeletonCard: React.FC = () => (
  <View style={cardStyles.container}>
    <Skeleton width="60%" height={24} style={{ marginBottom: 16 }} />
    <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
    <Skeleton width="80%" height={16} style={{ marginBottom: 16 }} />
    <Skeleton width="100%" height={120} borderRadius={DesignSystem.radius.lg} />
  </View>
);

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <View>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        width={index === lines - 1 ? '60%' : '100%'}
        height={16}
        style={{ marginBottom: 8 }}
      />
    ))}
  </View>
);

export const SkeletonCircle: React.FC<{ size?: number }> = ({ size = 60 }) => (
  <Skeleton width={size} height={size} borderRadius={size / 2} />
);

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.neutral[0],
    borderRadius: DesignSystem.radius.xl,
    padding: DesignSystem.spacing[8],
    ...DesignSystem.shadows.md,
    marginBottom: DesignSystem.spacing[6],
  },
});

