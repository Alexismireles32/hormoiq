/**
 * Aurora Animated Background Component
 * Beautiful animated gradient background for React Native
 * Inspired by Aceternity UI Aurora effect, adapted for mobile
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem } from '@/constants/DesignSystem';

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  colors?: string[];
  intensity?: 'low' | 'medium' | 'high';
  speed?: 'slow' | 'medium' | 'fast';
  style?: ViewStyle;
}

export function AuroraBackground({
  children,
  colors = [
    DesignSystem.colors.primary[100],
    DesignSystem.colors.primary[200],
    DesignSystem.colors.primary[300],
    DesignSystem.colors.primary[400],
  ],
  intensity = 'medium',
  speed = 'medium',
  style,
}: AuroraBackgroundProps) {
  // Animation values for multiple moving gradients
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  // Speed configuration
  const speedDuration = {
    slow: 30000,
    medium: 20000,
    fast: 10000,
  };

  // Intensity (opacity) configuration
  const intensityOpacity = {
    low: 0.2,
    medium: 0.35,
    high: 0.5,
  };

  useEffect(() => {
    // Create infinite looping animations for each gradient blob
    const createAnimation = (animValue: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const baseDuration = speedDuration[speed];
    
    // Start animations with different durations for natural movement
    const animation1 = createAnimation(anim1, baseDuration);
    const animation2 = createAnimation(anim2, baseDuration * 1.3);
    const animation3 = createAnimation(anim3, baseDuration * 1.7);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [speed]);

  // Interpolate animation values for movement
  const blob1TranslateX = anim1.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });
  const blob1TranslateY = anim1.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 50],
  });
  const blob1Scale = anim1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.3, 1],
  });

  const blob2TranslateX = anim2.interpolate({
    inputRange: [0, 1],
    outputRange: [100, -100],
  });
  const blob2TranslateY = anim2.interpolate({
    inputRange: [0, 1],
    outputRange: [50, -50],
  });
  const blob2Scale = anim2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.4, 1],
  });

  const blob3TranslateX = anim3.interpolate({
    inputRange: [0, 1],
    outputRange: [50, -50],
  });
  const blob3TranslateY = anim3.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 80],
  });
  const blob3Scale = anim3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  const opacity = intensityOpacity[intensity];

  return (
    <View style={[styles.container, style]}>
      {/* Base gradient overlay */}
      <LinearGradient
        colors={[colors[0], colors[1], colors[2]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated gradient blob 1 - Top Left */}
      <Animated.View
        style={[
          styles.blob,
          styles.blobTopLeft,
          {
            opacity,
            transform: [
              { translateX: blob1TranslateX },
              { translateY: blob1TranslateY },
              { scale: blob1Scale },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[colors[0], colors[1], 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.blobGradient}
        />
      </Animated.View>

      {/* Animated gradient blob 2 - Bottom Right */}
      <Animated.View
        style={[
          styles.blob,
          styles.blobBottomRight,
          {
            opacity,
            transform: [
              { translateX: blob2TranslateX },
              { translateY: blob2TranslateY },
              { scale: blob2Scale },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[colors[2], colors[3], 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.blobGradient}
        />
      </Animated.View>

      {/* Animated gradient blob 3 - Center */}
      <Animated.View
        style={[
          styles.blob,
          styles.blobCenter,
          {
            opacity: opacity * 0.8,
            transform: [
              { translateX: blob3TranslateX },
              { translateY: blob3TranslateY },
              { scale: blob3Scale },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[colors[1], colors[2], 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.blobGradient}
        />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: DesignSystem.colors.background,
  },
  blob: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  blobTopLeft: {
    top: -150,
    left: -150,
  },
  blobBottomRight: {
    bottom: -150,
    right: -150,
  },
  blobCenter: {
    top: '35%',
    left: '25%',
  },
  blobGradient: {
    flex: 1,
    borderRadius: 200,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});

