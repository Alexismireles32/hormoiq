import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { DesignSystem } from '@/constants/DesignSystem';

interface EliCircularProgressProps {
  value: number;
  label: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Eli Health-style circular progress indicator
 * Thin stroke, minimal, large numbers
 */
export function EliCircularProgress({
  value,
  label,
  sublabel,
  size = 180,
  strokeWidth = 2,
  children,
}: EliCircularProgressProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: value,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* SVG Progress Ring */}
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#000000"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        {children || (
          <>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
            {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: DesignSystem.typography.fontSize['7xl'],
    fontWeight: DesignSystem.typography.fontWeight.ultralight,
    color: '#000000',
    letterSpacing: -3,
    lineHeight: 80,
  },
  label: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.regular,
    color: '#000000',
    marginTop: DesignSystem.spacing[2],
  },
  sublabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[500],
    marginTop: DesignSystem.spacing[1],
  },
});

