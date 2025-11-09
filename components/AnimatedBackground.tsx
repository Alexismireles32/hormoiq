import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem } from '@/constants/DesignSystem';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  colors?: string[];
  speed?: number;
  opacity?: number;
}

const { width, height } = Dimensions.get('window');

/**
 * AnimatedBackground Component
 * 
 * Creates a beautiful, subtly animated gradient background inspired by mesh gradients.
 * Uses multiple animated LinearGradients with different angles and opacities to create
 * a fluid, organic effect similar to @paper-design/shaders-react mesh gradients.
 * 
 * Colors inspired by the original: soft teals, blushes, and pastels
 */
export default function AnimatedBackground({
  children,
  colors = [
    '#72b9bb', // Soft teal
    '#b5d9d9', // Light cyan
    '#ffd1bd', // Peach
    '#ffebe0', // Light blush
    '#8cc5b8', // Mint
    '#dbf4a4', // Light lime
  ],
  speed = 8000, // Duration of one animation cycle (ms)
  opacity = 0.15, // Overall opacity for subtlety
}: AnimatedBackgroundProps) {
  // Create multiple animated values for layered effect
  const rotate1 = useRef(new Animated.Value(0)).current;
  const rotate2 = useRef(new Animated.Value(0)).current;
  const rotate3 = useRef(new Animated.Value(0)).current;
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create infinite rotation animations at different speeds
    const animation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate1, {
          toValue: 1,
          duration: speed,
          useNativeDriver: true,
        }),
        Animated.timing(rotate1, {
          toValue: 0,
          duration: speed,
          useNativeDriver: true,
        }),
      ])
    );

    const animation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate2, {
          toValue: 1,
          duration: speed * 1.3, // Slightly slower
          useNativeDriver: true,
        }),
        Animated.timing(rotate2, {
          toValue: 0,
          duration: speed * 1.3,
          useNativeDriver: true,
        }),
      ])
    );

    const animation3 = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate3, {
          toValue: 1,
          duration: speed * 0.8, // Slightly faster
          useNativeDriver: true,
        }),
        Animated.timing(rotate3, {
          toValue: 0,
          duration: speed * 0.8,
          useNativeDriver: true,
        }),
      ])
    );

    // Create breathing scale animations
    const scaleAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(scale1, {
          toValue: 1.2,
          duration: speed * 1.5,
          useNativeDriver: true,
        }),
        Animated.timing(scale1, {
          toValue: 1,
          duration: speed * 1.5,
          useNativeDriver: true,
        }),
      ])
    );

    const scaleAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(scale2, {
          toValue: 1.3,
          duration: speed * 1.2,
          useNativeDriver: true,
        }),
        Animated.timing(scale2, {
          toValue: 1,
          duration: speed * 1.2,
          useNativeDriver: true,
        }),
      ])
    );

    animation1.start();
    animation2.start();
    animation3.start();
    scaleAnimation1.start();
    scaleAnimation2.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
      scaleAnimation1.stop();
      scaleAnimation2.stop();
    };
  }, [speed]);

  // Interpolate rotation values
  const rotation1 = rotate1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotation2 = rotate2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'], // Opposite direction
  });

  const rotation3 = rotate3.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background Layer 1 - Base gradient */}
      <Animated.View
        style={[
          styles.gradientLayer,
          {
            opacity: opacity * 0.6,
            transform: [
              { rotate: rotation1 },
              { scale: scale1 },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[colors[0], colors[1], colors[2]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Background Layer 2 - Overlay gradient */}
      <Animated.View
        style={[
          styles.gradientLayer,
          {
            opacity: opacity * 0.5,
            transform: [
              { rotate: rotation2 },
              { scale: scale2 },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[colors[3], colors[4], colors[5]]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Background Layer 3 - Accent gradient */}
      <Animated.View
        style={[
          styles.gradientLayer,
          {
            opacity: opacity * 0.4,
            transform: [
              { rotate: rotation3 },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[colors[2], colors[5], colors[0]]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* White veil overlay for subtlety */}
      <View style={[styles.veil, { backgroundColor: `rgba(249, 250, 251, ${0.85})` }]} />

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: DesignSystem.colors.background,
  },
  gradientLayer: {
    position: 'absolute',
    top: -height * 0.2,
    left: -width * 0.2,
    width: width * 1.4,
    height: height * 1.4,
  },
  gradient: {
    flex: 1,
  },
  veil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
});

