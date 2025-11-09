import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type BackgroundType = 'yellow' | 'purple' | 'blue' | 'green' | 'pink' | 'multi';

interface BlurCircle {
  id: number;
  color: string;
  size: number;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
  translateX: Animated.Value;
  translateY: Animated.Value;
  scale: Animated.Value;
}

interface EliAnimatedBackgroundProps {
  type?: BackgroundType;
  children: React.ReactNode;
  style?: any;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Eli Health-style animated gradient background
 * Features:
 * - 6 floating blur circles with independent animations
 * - Smooth, organic movement patterns
 * - Pastel color palette
 * - Continuous animation loops
 * - Optimized for 60fps performance
 */
export function EliAnimatedBackground({
  type = 'multi',
  children,
  style,
}: EliAnimatedBackgroundProps) {
  const circlesRef = useRef<BlurCircle[]>([]);

  // Initialize circles with animation values
  useEffect(() => {
    circlesRef.current = [
      {
        id: 1,
        color: 'rgba(255, 223, 186, 0.4)', // Soft peach
        size: 400,
        initialX: 10,
        initialY: 20,
        duration: 25000,
        delay: 0,
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(1),
      },
      {
        id: 2,
        color: 'rgba(200, 162, 255, 0.35)', // Soft purple
        size: 450,
        initialX: 70,
        initialY: 10,
        duration: 28000,
        delay: 2000,
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(1),
      },
      {
        id: 3,
        color: 'rgba(147, 197, 253, 0.3)', // Soft blue
        size: 380,
        initialX: 20,
        initialY: 70,
        duration: 30000,
        delay: 4000,
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(1),
      },
      {
        id: 4,
        color: 'rgba(134, 239, 172, 0.35)', // Soft green
        size: 420,
        initialX: 80,
        initialY: 60,
        duration: 26000,
        delay: 1000,
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(1),
      },
      {
        id: 5,
        color: 'rgba(251, 207, 232, 0.3)', // Soft pink
        size: 360,
        initialX: 50,
        initialY: 40,
        duration: 32000,
        delay: 3000,
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(1),
      },
      {
        id: 6,
        color: 'rgba(254, 240, 138, 0.25)', // Soft yellow
        size: 340,
        initialX: 40,
        initialY: 80,
        duration: 27000,
        delay: 5000,
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(1),
      },
    ];

    // Start animations for each circle
    circlesRef.current.forEach((circle) => {
      startCircleAnimation(circle);
    });

    // Cleanup
    return () => {
      circlesRef.current.forEach((circle) => {
        circle.translateX.stopAnimation();
        circle.translateY.stopAnimation();
        circle.scale.stopAnimation();
      });
    };
  }, []);

  const generateOrganicPath = (radius: number) => {
    // Generate organic, smooth movement path
    const numPoints = 8;
    const points = [];

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * radius * 0.3;
      points.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      });
    }

    return points;
  };

  const startCircleAnimation = (circle: BlurCircle) => {
    const movementRadius = 80; // pixels to move
    const path = generateOrganicPath(movementRadius);

    // Create looping animation sequence
    const createPathAnimation = (axis: 'x' | 'y', animValue: Animated.Value) => {
      const values = path.map((p) => (axis === 'x' ? p.x : p.y));
      values.push(values[0]); // Close the loop

      return Animated.loop(
        Animated.sequence(
          values.map((value, index) =>
            Animated.timing(animValue, {
              toValue: value,
              duration: circle.duration / values.length,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
              delay: index === 0 ? circle.delay : 0,
            })
          )
        )
      );
    };

    // Create scale pulsing animation
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(circle.scale, {
          toValue: 1.1,
          duration: circle.duration / 4,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(circle.scale, {
          toValue: 0.95,
          duration: circle.duration / 4,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(circle.scale, {
          toValue: 1.05,
          duration: circle.duration / 4,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(circle.scale, {
          toValue: 1,
          duration: circle.duration / 4,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Start all animations in parallel
    Animated.parallel([
      createPathAnimation('x', circle.translateX),
      createPathAnimation('y', circle.translateY),
      scaleAnimation,
    ]).start();
  };

  const getGradientColors = () => {
    switch (type) {
      case 'yellow':
        return ['#FFFBEB', '#FEF3C7', '#FDE68A'];
      case 'purple':
        return ['#FAF5FF', '#F3E8FF', '#E9D5FF'];
      case 'blue':
        return ['#EFF6FF', '#DBEAFE', '#BFDBFE'];
      case 'green':
        return ['#F0FDF4', '#DCFCE7', '#BBF7D0'];
      case 'pink':
        return ['#FFF1F2', '#FFE4E6', '#FECDD3'];
      case 'multi':
      default:
        return ['#FAF5FF', '#FFF1F2', '#EFF6FF']; // Multi-color base
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Base gradient background */}
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Animated blur circles */}
        <View style={styles.blurContainer}>
          {circlesRef.current.map((circle) => (
            <Animated.View
              key={circle.id}
              style={[
                styles.blurCircle,
                {
                  width: circle.size,
                  height: circle.size,
                  backgroundColor: circle.color,
                  left: `${circle.initialX}%`,
                  top: `${circle.initialY}%`,
                  transform: [
                    { translateX: circle.translateX },
                    { translateY: circle.translateY },
                    { scale: circle.scale },
                  ],
                },
              ]}
            />
          ))}
        </View>

        {/* Subtle overlay for depth */}
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.overlay}
        />

        {/* Content layer */}
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
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blurCircle: {
    position: 'absolute',
    borderRadius: 9999,
    // Note: React Native doesn't support CSS blur filter
    // The blur effect is simulated through opacity and multiple overlapping circles
    opacity: 0.6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 10,
  },
});

