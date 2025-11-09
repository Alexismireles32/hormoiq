import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem } from '@/constants/DesignSystem';

type BackgroundType = 'yellow' | 'purple' | 'blue' | 'green' | 'pink' | 'multi';

interface FloatingCircle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  translateX: Animated.Value;
  translateY: Animated.Value;
  scale: Animated.Value;
  parallaxOffset: Animated.Value;
}

interface EliAnimatedBackgroundProps {
  type?: BackgroundType;
  children: React.ReactNode;
  style?: any;
  onScroll?: (event: any) => void;
  scrollEnabled?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Eli Health-style animated gradient background with parallax scroll
 * Features:
 * - Soft pastel gradients
 * - Floating blur circles that animate
 * - Parallax effect on scroll
 * - Smooth continuous animations
 * - Depth layers for visual richness
 */
export function EliAnimatedBackground({
  type = 'multi',
  children,
  style,
  onScroll,
  scrollEnabled = true,
}: EliAnimatedBackgroundProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [circles] = useState<FloatingCircle[]>(() => {
    const colors = [
      'rgba(255, 245, 157, 0.3)', // Soft yellow
      'rgba(206, 147, 216, 0.3)', // Soft purple
      'rgba(144, 202, 249, 0.3)', // Soft blue
      'rgba(165, 214, 167, 0.3)', // Soft green
      'rgba(248, 187, 208, 0.3)', // Soft pink
    ];

    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * (SCREEN_WIDTH - 200),
      y: Math.random() * (SCREEN_HEIGHT - 200),
      size: Math.random() * 300 + 200,
      color: colors[Math.floor(Math.random() * colors.length)],
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      scale: new Animated.Value(1),
      parallaxOffset: new Animated.Value(0),
    }));
  });

  useEffect(() => {
    // Pulse animation for gradient overlay
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animate each floating circle
    circles.forEach((circle, index) => {
      const duration = 15000 + Math.random() * 10000;
      const delay = index * 1000;

      // X movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(circle.translateX, {
            toValue: 30,
            duration: duration / 3,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(circle.translateX, {
            toValue: -30,
            duration: (duration / 3) * 2,
            useNativeDriver: true,
          }),
          Animated.timing(circle.translateX, {
            toValue: 0,
            duration: duration / 3,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Y movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(circle.translateY, {
            toValue: -40,
            duration: duration / 2,
            delay: delay + 500,
            useNativeDriver: true,
          }),
          Animated.timing(circle.translateY, {
            toValue: 40,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(circle.translateY, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Scale animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(circle.scale, {
            toValue: 1.1,
            duration: duration / 4,
            delay: delay + 1000,
            useNativeDriver: true,
          }),
          Animated.timing(circle.scale, {
            toValue: 0.9,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(circle.scale, {
            toValue: 1,
            duration: duration / 4,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const getGradientColors = () => {
    switch (type) {
      case 'yellow':
        return ['#fef9e7', '#fff9e6', '#fffbeb'];
      case 'purple':
        return ['#fef5ff', '#f8f3ff', '#faf5ff'];
      case 'blue':
        return ['#eff6ff', '#f0f8ff', '#eff6ff'];
      case 'green':
        return ['#f0fdf4', '#f0fdf4', '#f0fdf4'];
      case 'pink':
        return ['#fff1f2', '#fef9e7', '#fff1f2'];
      case 'multi':
        return ['#fef9e7', '#f8f3ff', '#f0f8ff'];
      default:
        return ['#f0f8ff', '#fef9e7', '#f8f3ff'];
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: onScroll,
    }
  );

  return (
    <View style={[styles.container, style]}>
      {/* Base gradient */}
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Pulsing overlay gradient */}
      <Animated.View
        style={[
          styles.overlayGradient,
          {
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.6],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255, 249, 230, 0.5)', 'rgba(254, 245, 255, 0.5)', 'rgba(240, 248, 255, 0.5)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Floating blur circles */}
      <View style={styles.circlesContainer} pointerEvents="none">
        {circles.map((circle) => {
          // Parallax effect based on scroll
          const parallaxY = scrollY.interpolate({
            inputRange: [0, 1000],
            outputRange: [0, -circle.size * 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={circle.id}
              style={[
                styles.blurCircle,
                {
                  left: circle.x,
                  top: circle.y,
                  width: circle.size,
                  height: circle.size,
                  backgroundColor: circle.color,
                  transform: [
                    { translateX: circle.translateX },
                    { translateY: Animated.add(circle.translateY, parallaxY) },
                    { scale: circle.scale },
                  ],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Additional depth layer */}
      <View style={styles.depthLayer} pointerEvents="none">
        {Array.from({ length: 5 }).map((_, i) => {
          const depthY = scrollY.interpolate({
            inputRange: [0, 1000],
            outputRange: [0, -i * 20],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={`depth-${i}`}
              style={[
                styles.depthCircle,
                {
                  left: Math.random() * (SCREEN_WIDTH - 150),
                  top: Math.random() * (SCREEN_HEIGHT - 150),
                  width: Math.random() * 150 + 100,
                  height: Math.random() * 150 + 100,
                  backgroundColor: [
                    'rgba(255, 235, 59, 0.2)',
                    'rgba(186, 104, 200, 0.2)',
                    'rgba(100, 181, 246, 0.2)',
                    'rgba(129, 199, 132, 0.2)',
                    'rgba(240, 98, 146, 0.2)',
                  ][i % 5],
                  transform: [{ translateY: depthY }],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Subtle gradient mesh overlay */}
      <View style={styles.meshOverlay} pointerEvents="none">
        <View style={[styles.meshGradient, { top: '20%', left: '10%' }]}>
          <LinearGradient
            colors={['rgba(255, 245, 157, 0.4)', 'transparent']}
            style={styles.meshCircle}
          />
        </View>
        <View style={[styles.meshGradient, { top: '10%', right: '5%' }]}>
          <LinearGradient
            colors={['rgba(206, 147, 216, 0.4)', 'transparent']}
            style={styles.meshCircle}
          />
        </View>
        <View style={[styles.meshGradient, { top: '60%', left: '30%' }]}>
          <LinearGradient
            colors={['rgba(144, 202, 249, 0.4)', 'transparent']}
            style={styles.meshCircle}
          />
        </View>
        <View style={[styles.meshGradient, { bottom: '10%', right: '10%' }]}>
          <LinearGradient
            colors={['rgba(165, 214, 167, 0.4)', 'transparent']}
            style={styles.meshCircle}
          />
        </View>
        <View style={[styles.meshGradient, { bottom: '5%', left: '5%' }]}>
          <LinearGradient
            colors={['rgba(248, 187, 208, 0.4)', 'transparent']}
            style={styles.meshCircle}
          />
        </View>
      </View>

      {/* Content with scroll */}
      {scrollEnabled ? (
        <Animated.ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {children}
        </Animated.ScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurCircle: {
    position: 'absolute',
    borderRadius: 9999,
    // Note: React Native doesn't support blur filter directly
    // We simulate it with opacity and shadows
    opacity: 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 80,
  },
  depthLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
  },
  depthCircle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.5,
  },
  meshOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  meshGradient: {
    position: 'absolute',
    width: 300,
    height: 300,
  },
  meshCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});

