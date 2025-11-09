/**
 * Aurora Background - Aceternity UI Style
 * Recreates the distinctive aurora shimmer effect for React Native
 * Based on 21st.dev aurora-background component
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem } from '@/constants/DesignSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  showRadialGradient?: boolean;
  style?: ViewStyle;
}

export function AuroraBackground({
  children,
  showRadialGradient = true,
  style,
}: AuroraBackgroundProps) {
  // Animation values for the aurora effect
  const auroraAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create the signature 60s aurora animation (like the original)
    const animation = Animated.loop(
      Animated.timing(auroraAnim, {
        toValue: 1,
        duration: 60000, // 60 seconds like the original
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  // Interpolate for the aurora movement (50% to 350% background position)
  const translateX = auroraAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH * 3], // Simulate 300% background-size movement
  });

  return (
    <View style={[styles.container, style]}>
      {/* Base background - subtle off-white/gray */}
      <View style={styles.baseBackground} />

      {/* Aurora shimmer layer 1 - Main gradient stripes */}
      <Animated.View
        style={[
          styles.auroraLayer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'transparent',
            'rgba(96, 165, 250, 0.15)',  // blue-400
            'rgba(165, 180, 252, 0.12)', // indigo-300
            'rgba(147, 197, 253, 0.15)', // blue-300
            'rgba(221, 214, 254, 0.10)', // violet-200
            'rgba(96, 165, 250, 0.15)',  // blue-400
            'transparent',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Aurora shimmer layer 2 - Secondary effect (mix-blend-difference simulation) */}
      <Animated.View
        style={[
          styles.auroraLayerSecondary,
          {
            transform: [{ translateX: Animated.multiply(translateX, 0.7) }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(139, 92, 246, 0.08)', // violet-500
            'rgba(167, 139, 250, 0.10)', // violet-400
            'rgba(196, 181, 253, 0.08)', // violet-300
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Radial gradient mask (optional - for the ellipse effect) */}
      {showRadialGradient && (
        <View style={styles.radialMask} pointerEvents="none">
          <LinearGradient
            colors={['rgba(249, 250, 251, 0)', 'rgba(249, 250, 251, 0.3)', 'rgba(249, 250, 251, 0.7)']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      )}

      {/* Content layer */}
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  baseBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F9FAFB', // bg-zinc-50 equivalent (off-white)
  },
  auroraLayer: {
    position: 'absolute',
    top: -10,
    left: -SCREEN_WIDTH * 1.5,
    right: -SCREEN_WIDTH * 1.5,
    bottom: -10,
    width: SCREEN_WIDTH * 4, // 300% size for movement
    height: SCREEN_HEIGHT + 20,
    opacity: 0.5, // Match original opacity
  },
  auroraLayerSecondary: {
    position: 'absolute',
    top: -10,
    left: -SCREEN_WIDTH * 1.5,
    right: -SCREEN_WIDTH * 1.5,
    bottom: -10,
    width: SCREEN_WIDTH * 4,
    height: SCREEN_HEIGHT + 20,
    opacity: 0.3,
  },
  gradient: {
    flex: 1,
  },
  radialMask: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
