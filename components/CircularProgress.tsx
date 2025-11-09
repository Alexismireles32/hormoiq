import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  size?: number;
  progress: number; // 0-100
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
}

export function CircularProgress({
  size = 80,
  progress,
  strokeWidth = 8,
  color = DesignSystem.colors.primary,
  backgroundColor = DesignSystem.colors.neutral[200],
  showPercentage = true,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
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
        <Circle
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
      {showPercentage && (
        <View style={styles.textContainer}>
          <Text style={[styles.percentageText, { color }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

