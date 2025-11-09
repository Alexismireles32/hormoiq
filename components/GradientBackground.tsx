import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem } from '@/constants/DesignSystem';

interface GradientBackgroundProps {
  variant?: 'default' | 'wellness' | 'calm' | 'energetic' | 'night' | 'morning' | 'afternoon' | 'evening';
  intensity?: 'subtle' | 'medium' | 'bold';
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * GradientBackground - Simple, performant gradient background
 * 
 * Use this for static gradient backgrounds without animation.
 * Much more performant for screens that don't need animation.
 */
export default function GradientBackground({
  variant = 'default',
  intensity = 'subtle',
  children,
  style,
}: GradientBackgroundProps) {
  const getGradientConfig = () => {
    const baseOpacity = intensity === 'subtle' ? 0.15 : intensity === 'medium' ? 0.35 : 0.55;

    switch (variant) {
      case 'wellness':
        return {
          colors: [
            `rgba(114, 185, 187, ${baseOpacity})`, // Teal
            `rgba(181, 217, 217, ${baseOpacity * 0.7})`, // Light teal
            `rgba(255, 235, 224, ${baseOpacity * 0.4})`, // Light peach
            DesignSystem.colors.background, // Fade to base background
          ],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        };

      case 'calm':
        return {
          colors: [
            `rgba(147, 197, 253, ${baseOpacity})`, // Sky blue
            `rgba(196, 181, 253, ${baseOpacity * 0.7})`, // Lavender
            `rgba(249, 250, 251, ${baseOpacity * 0.4})`, // Off-white
            DesignSystem.colors.background,
          ],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        };

      case 'energetic':
        return {
          colors: [
            `rgba(251, 191, 36, ${baseOpacity})`, // Amber
            `rgba(252, 211, 77, ${baseOpacity * 0.7})`, // Light amber
            `rgba(254, 243, 199, ${baseOpacity * 0.4})`, // Cream
            DesignSystem.colors.background,
          ],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        };

      case 'night':
        return {
          colors: [
            `rgba(79, 70, 229, ${baseOpacity})`, // Indigo
            `rgba(99, 102, 241, ${baseOpacity * 0.7})`, // Light indigo
            `rgba(139, 92, 246, ${baseOpacity * 0.4})`, // Purple
            DesignSystem.colors.background,
          ],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        };

      case 'morning':
        return {
          colors: [
            `rgba(251, 191, 36, ${baseOpacity})`, // Warm amber
            `rgba(254, 243, 199, ${baseOpacity * 0.7})`, // Cream
            `rgba(255, 255, 255, ${baseOpacity * 0.4})`, // White
            DesignSystem.colors.background,
          ],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        };

      case 'afternoon':
        return {
          colors: [
            `rgba(147, 197, 253, ${baseOpacity})`, // Sky blue
            `rgba(224, 242, 254, ${baseOpacity * 0.7})`, // Light blue
            `rgba(255, 255, 255, ${baseOpacity * 0.4})`, // White
            DesignSystem.colors.background,
          ],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        };

      case 'evening':
        return {
          colors: [
            `rgba(99, 102, 241, ${baseOpacity})`, // Indigo
            `rgba(196, 181, 253, ${baseOpacity * 0.7})`, // Lavender
            `rgba(237, 233, 254, ${baseOpacity * 0.4})`, // Light purple
            DesignSystem.colors.background,
          ],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        };

      default: // 'default' - Very subtle off-white gradient
        return {
          colors: [
            `rgba(249, 250, 251, ${baseOpacity * 0.5})`, // Off-white
            `rgba(255, 255, 255, ${baseOpacity * 0.3})`, // White
            DesignSystem.colors.background,
            DesignSystem.colors.background,
          ],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        };
    }
  };

  const config = getGradientConfig();

  return (
    <LinearGradient
      colors={config.colors}
      start={config.start}
      end={config.end}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

