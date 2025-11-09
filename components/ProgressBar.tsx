import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, ViewStyle } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Linear Progress Bar
interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  height = 8,
  color = DesignSystem.colors.primary[500],
  backgroundColor = DesignSystem.colors.neutral[200],
  showPercentage = false,
  animated = true,
  style,
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.spring(animatedWidth, {
        toValue: clampedProgress,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      animatedWidth.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, animatedWidth]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { height, backgroundColor }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolation,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
      )}
    </View>
  );
}

// Circular Progress Ring
interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  children?: React.ReactNode;
}

export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  color = DesignSystem.colors.primary[500],
  backgroundColor = DesignSystem.colors.neutral[200],
  showPercentage = true,
  animated = true,
  children,
}: CircularProgressProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (animated) {
      Animated.spring(animatedProgress, {
        toValue: clampedProgress,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      animatedProgress.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, animatedProgress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      
      <View style={styles.circularContent}>
        {children || (showPercentage && (
          <Text style={styles.circularPercentage}>{Math.round(clampedProgress)}%</Text>
        ))}
      </View>
    </View>
  );
}

// Multi-segment Progress Bar (for showing different phases)
interface SegmentProgressProps {
  segments: { value: number; color: string; label?: string }[];
  height?: number;
  showLabels?: boolean;
  style?: ViewStyle;
}

export function SegmentProgress({
  segments,
  height = 12,
  showLabels = false,
  style,
}: SegmentProgressProps) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.segmentTrack, { height }]}>
        {segments.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          return (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  width: `${percentage}%`,
                  backgroundColor: segment.color,
                  height,
                  borderTopLeftRadius: index === 0 ? DesignSystem.radius.full : 0,
                  borderBottomLeftRadius: index === 0 ? DesignSystem.radius.full : 0,
                  borderTopRightRadius:
                    index === segments.length - 1 ? DesignSystem.radius.full : 0,
                  borderBottomRightRadius:
                    index === segments.length - 1 ? DesignSystem.radius.full : 0,
                },
              ]}
            />
          );
        })}
      </View>
      {showLabels && (
        <View style={styles.labelContainer}>
          {segments.map(
            (segment, index) =>
              segment.label && (
                <View key={index} style={styles.labelItem}>
                  <View
                    style={[styles.labelDot, { backgroundColor: segment.color }]}
                  />
                  <Text style={styles.labelText}>{segment.label}</Text>
                </View>
              )
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    borderRadius: DesignSystem.radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: DesignSystem.radius.full,
  },
  percentage: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[600],
    marginTop: DesignSystem.spacing[1],
    textAlign: 'right',
  },
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularPercentage: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: '200',
    color: DesignSystem.colors.neutral[900],
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: DesignSystem.radius.full,
    overflow: 'hidden',
  },
  segment: {
    // Styles applied dynamically
  },
  labelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: DesignSystem.spacing[3],
    gap: DesignSystem.spacing[4],
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing[2],
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: DesignSystem.radius.full,
  },
  labelText: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[700],
  },
});

