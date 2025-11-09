import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem } from '@/constants/DesignSystem';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  variant?: 'default' | 'wellness' | 'calm' | 'energetic' | 'night';
  intensity?: 'subtle' | 'medium' | 'bold';
  animate?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * AnimatedBackground - Smooth gradient background inspired by mesh gradients
 * 
 * Provides beautiful, animated gradient backgrounds for different app contexts.
 * Uses LinearGradient with animated opacity to create smooth, calming effects.
 */
export default function AnimatedBackground({
  variant = 'default',
  intensity = 'subtle',
  animate = true,
  children,
  style,
}: AnimatedBackgroundProps) {
  const opacity1 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(0)).current;
  const opacity3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;

    // Create a breathing animation that cycles through gradient layers
    const animation = Animated.loop(
      Animated.sequence([
        // Phase 1: Show gradient 1
        Animated.parallel([
          Animated.timing(opacity1, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity2, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity3, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        // Phase 2: Transition to gradient 2
        Animated.parallel([
          Animated.timing(opacity1, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity2, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity3, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        // Phase 3: Transition to gradient 3
        Animated.parallel([
          Animated.timing(opacity1, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity2, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity3, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animate, opacity1, opacity2, opacity3]);

  const getGradients = () => {
    const baseOpacity = intensity === 'subtle' ? 0.3 : intensity === 'medium' ? 0.5 : 0.7;

    switch (variant) {
      case 'wellness':
        return {
          gradient1: {
            colors: [
              `rgba(114, 185, 187, ${baseOpacity})`, // Teal
              `rgba(181, 217, 217, ${baseOpacity * 0.8})`, // Light teal
              `rgba(255, 209, 189, ${baseOpacity * 0.6})`, // Peach
            ],
            locations: [0, 0.5, 1],
          },
          gradient2: {
            colors: [
              `rgba(255, 209, 189, ${baseOpacity})`, // Peach
              `rgba(255, 235, 224, ${baseOpacity * 0.8})`, // Light peach
              `rgba(140, 197, 184, ${baseOpacity * 0.6})`, // Mint
            ],
            locations: [0, 0.5, 1],
          },
          gradient3: {
            colors: [
              `rgba(140, 197, 184, ${baseOpacity})`, // Mint
              `rgba(219, 244, 164, ${baseOpacity * 0.8})`, // Light green
              `rgba(114, 185, 187, ${baseOpacity * 0.6})`, // Teal
            ],
            locations: [0, 0.5, 1],
          },
        };

      case 'calm':
        return {
          gradient1: {
            colors: [
              `rgba(147, 197, 253, ${baseOpacity})`, // Sky blue
              `rgba(196, 181, 253, ${baseOpacity * 0.8})`, // Lavender
              `rgba(249, 250, 251, ${baseOpacity * 0.6})`, // Off-white
            ],
            locations: [0, 0.5, 1],
          },
          gradient2: {
            colors: [
              `rgba(196, 181, 253, ${baseOpacity})`, // Lavender
              `rgba(245, 243, 255, ${baseOpacity * 0.8})`, // Very light purple
              `rgba(147, 197, 253, ${baseOpacity * 0.6})`, // Sky blue
            ],
            locations: [0, 0.5, 1],
          },
          gradient3: {
            colors: [
              `rgba(249, 250, 251, ${baseOpacity})`, // Off-white
              `rgba(147, 197, 253, ${baseOpacity * 0.8})`, // Sky blue
              `rgba(196, 181, 253, ${baseOpacity * 0.6})`, // Lavender
            ],
            locations: [0, 0.5, 1],
          },
        };

      case 'energetic':
        return {
          gradient1: {
            colors: [
              `rgba(251, 191, 36, ${baseOpacity})`, // Amber
              `rgba(252, 211, 77, ${baseOpacity * 0.8})`, // Light amber
              `rgba(254, 243, 199, ${baseOpacity * 0.6})`, // Cream
            ],
            locations: [0, 0.5, 1],
          },
          gradient2: {
            colors: [
              `rgba(252, 211, 77, ${baseOpacity})`, // Light amber
              `rgba(254, 243, 199, ${baseOpacity * 0.8})`, // Cream
              `rgba(251, 191, 36, ${baseOpacity * 0.6})`, // Amber
            ],
            locations: [0, 0.5, 1],
          },
          gradient3: {
            colors: [
              `rgba(254, 243, 199, ${baseOpacity})`, // Cream
              `rgba(251, 191, 36, ${baseOpacity * 0.8})`, // Amber
              `rgba(252, 211, 77, ${baseOpacity * 0.6})`, // Light amber
            ],
            locations: [0, 0.5, 1],
          },
        };

      case 'night':
        return {
          gradient1: {
            colors: [
              `rgba(79, 70, 229, ${baseOpacity})`, // Indigo
              `rgba(99, 102, 241, ${baseOpacity * 0.8})`, // Light indigo
              `rgba(139, 92, 246, ${baseOpacity * 0.6})`, // Purple
            ],
            locations: [0, 0.5, 1],
          },
          gradient2: {
            colors: [
              `rgba(99, 102, 241, ${baseOpacity})`, // Light indigo
              `rgba(139, 92, 246, ${baseOpacity * 0.8})`, // Purple
              `rgba(79, 70, 229, ${baseOpacity * 0.6})`, // Indigo
            ],
            locations: [0, 0.5, 1],
          },
          gradient3: {
            colors: [
              `rgba(139, 92, 246, ${baseOpacity})`, // Purple
              `rgba(79, 70, 229, ${baseOpacity * 0.8})`, // Indigo
              `rgba(99, 102, 241, ${baseOpacity * 0.6})`, // Light indigo
            ],
            locations: [0, 0.5, 1],
          },
        };

      default: // 'default' - Off-white with subtle tints
        return {
          gradient1: {
            colors: [
              `rgba(249, 250, 251, ${baseOpacity})`, // Off-white
              `rgba(243, 244, 246, ${baseOpacity * 0.9})`, // Light gray
              `rgba(255, 255, 255, ${baseOpacity * 0.8})`, // White
            ],
            locations: [0, 0.5, 1],
          },
          gradient2: {
            colors: [
              `rgba(243, 244, 246, ${baseOpacity})`, // Light gray
              `rgba(255, 255, 255, ${baseOpacity * 0.9})`, // White
              `rgba(249, 250, 251, ${baseOpacity * 0.8})`, // Off-white
            ],
            locations: [0, 0.5, 1],
          },
          gradient3: {
            colors: [
              `rgba(255, 255, 255, ${baseOpacity})`, // White
              `rgba(249, 250, 251, ${baseOpacity * 0.9})`, // Off-white
              `rgba(243, 244, 246, ${baseOpacity * 0.8})`, // Light gray
            ],
            locations: [0, 0.5, 1],
          },
        };
    }
  };

  const gradients = getGradients();

  return (
    <Animated.View style={[styles.container, style]}>
      {/* Base solid background */}
      <Animated.View style={[styles.baseLayer, { backgroundColor: DesignSystem.colors.background }]} />

      {/* Gradient Layer 1 */}
      <Animated.View style={[styles.gradientLayer, { opacity: opacity1 }]}>
        <LinearGradient
          colors={gradients.gradient1.colors}
          locations={gradients.gradient1.locations}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Gradient Layer 2 */}
      <Animated.View style={[styles.gradientLayer, { opacity: opacity2 }]}>
        <LinearGradient
          colors={gradients.gradient2.colors}
          locations={gradients.gradient2.locations}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Gradient Layer 3 */}
      <Animated.View style={[styles.gradientLayer, { opacity: opacity3 }]}>
        <LinearGradient
          colors={gradients.gradient3.colors}
          locations={gradients.gradient3.locations}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Content */}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  baseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
    width: width,
    height: height,
  },
});

