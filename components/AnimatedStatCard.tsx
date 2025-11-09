import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';

export type StatCardType = 'tests' | 'streak' | 'completion' | 'protocols' | 'hormones' | 'days';

interface AnimatedStatCardProps {
  type: StatCardType;
  value: number;
  label: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  gradient: string[];
  onPress?: () => void;
}

export function AnimatedStatCard({
  type,
  value,
  label,
  icon,
  trend,
  trendValue,
  gradient,
  onPress,
}: AnimatedStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Count-up animation
    const duration = 1500;
    const steps = 60;
    const stepValue = value / steps;
    const stepDuration = duration / steps;

    let currentValue = 0;
    const interval = setInterval(() => {
      currentValue += stepValue;
      if (currentValue >= value) {
        setDisplayValue(value);
        clearInterval(interval);
        
        // Sparkle effect when complete
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        setDisplayValue(Math.round(currentValue));
      }
    }, stepDuration);

    // Icon pulse animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, [value]);

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  };

  const getTrendColor = () => {
    if (!trend) return DesignSystem.colors.neutral[500];
    return trend === 'up'
      ? '#10b981'
      : trend === 'down'
      ? '#ef4444'
      : DesignSystem.colors.neutral[500];
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={handlePress}
      disabled={!onPress}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Sparkle Effect */}
          <Animated.View
            style={[
              styles.sparkle,
              {
                opacity: sparkleAnim,
                transform: [
                  { scale: sparkleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 2],
                  })},
                ],
              },
            ]}
          >
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>

          {/* Icon */}
          <Animated.Text
            style={[
              styles.icon,
              {
                transform: [{ scale: iconPulse }],
              },
            ]}
          >
            {icon}
          </Animated.Text>

          {/* Value */}
          <Text style={styles.value}>{displayValue}</Text>

          {/* Label */}
          <Text style={styles.label}>{label}</Text>

          {/* Trend Indicator */}
          {trend && trendValue && (
            <View style={styles.trendContainer}>
              <Text style={[styles.trendIcon, { color: getTrendColor() }]}>
                {getTrendIcon()}
              </Text>
              <Text style={[styles.trendValue, { color: getTrendColor() }]}>
                {trendValue}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignSystem.radius.xl,
    overflow: 'hidden',
    ...DesignSystem.shadows.md,
  },
  gradient: {
    padding: DesignSystem.spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    top: DesignSystem.spacing[4],
    right: DesignSystem.spacing[4],
  },
  sparkleText: {
    fontSize: 24,
  },
  icon: {
    fontSize: 36,
    marginBottom: DesignSystem.spacing[3],
  },
  value: {
    fontSize: 42,
    fontWeight: '200',
    color: '#FFFFFF',
    marginBottom: DesignSystem.spacing[2],
    letterSpacing: -2,
  },
  label: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: DesignSystem.spacing[2],
    gap: DesignSystem.spacing[1],
  },
  trendIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  trendValue: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
});

