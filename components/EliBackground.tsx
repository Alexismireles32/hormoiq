import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem } from '@/constants/DesignSystem';

type BackgroundType = 'yellow' | 'purple' | 'blue' | 'green' | 'pink' | 'multi';

interface EliBackgroundProps {
  type?: BackgroundType;
  children: React.ReactNode;
  style?: any;
}

/**
 * Eli Health-style gradient background
 * Soft, blurred gradient backgrounds for screens
 */
export function EliBackground({ type = 'multi', children, style }: EliBackgroundProps) {
  const getGradientColors = () => {
    switch (type) {
      case 'yellow':
        return DesignSystem.colors.gradients.yellowBlur;
      case 'purple':
        return DesignSystem.colors.gradients.purpleBlur;
      case 'blue':
        return DesignSystem.colors.gradients.blueBlur;
      case 'green':
        return DesignSystem.colors.gradients.greenBlur;
      case 'pink':
        return DesignSystem.colors.gradients.pinkBlur;
      case 'multi':
        return DesignSystem.colors.gradients.multiBlur;
      default:
        return DesignSystem.colors.gradients.blueBlur;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Blur circles (simulate Eli's design) */}
        <View style={[styles.blurCircle, styles.blurCircle1, { backgroundColor: getGradientColors()[0] }]} />
        <View style={[styles.blurCircle, styles.blurCircle2, { backgroundColor: getGradientColors()[1] }]} />
        <View style={[styles.blurCircle, styles.blurCircle3, { backgroundColor: getGradientColors()[2] || getGradientColors()[0] }]} />
        
        {/* Content overlay */}
        <View style={styles.content}>{children}</View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  blurCircle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.4,
  },
  blurCircle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -50,
  },
  blurCircle2: {
    width: 250,
    height: 250,
    bottom: -80,
    left: -70,
  },
  blurCircle3: {
    width: 200,
    height: 200,
    top: '40%',
    right: -30,
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});

