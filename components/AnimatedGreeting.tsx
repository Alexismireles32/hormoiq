import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedGreetingProps {
  userName?: string;
  style?: any;
}

export default function AnimatedGreeting({ userName = 'User', style }: AnimatedGreetingProps) {
  const [greeting, setGreeting] = useState<string>('');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const nameSlideAnim = useState(new Animated.Value(30))[0];
  const lineScaleAnim = useState(new Animated.Value(0))[0];
  const subtitleFadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning');
        setTimeOfDay('morning');
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon');
        setTimeOfDay('afternoon');
      } else {
        setGreeting('Good Evening');
        setTimeOfDay('evening');
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Staggered animation sequence
    Animated.sequence([
      // Greeting fade in and slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Name slide up with delay
      Animated.timing(nameSlideAnim, {
        toValue: 0,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
      // Line scale from left
      Animated.timing(lineScaleAnim, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      // Subtitle fade in
      Animated.timing(subtitleFadeAnim, {
        toValue: 1,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getGradientColors = (): [string, string] => {
    switch (timeOfDay) {
      case 'morning':
        return ['#FFF9F5', '#FFF4ED']; // Warm amber/orange tones
      case 'afternoon':
        return ['#F0F9FF', '#E0F2FE']; // Cool blue/cyan tones
      case 'evening':
        return ['#F5F3FF', '#EDE9FE']; // Purple/indigo tones
      default:
        return [DesignSystem.colors.background, DesignSystem.colors.neutral[50]];
    }
  };

  const getAccentColor = (): string => {
    switch (timeOfDay) {
      case 'morning':
        return '#D97706'; // Amber-600
      case 'afternoon':
        return '#2563EB'; // Blue-600
      case 'evening':
        return '#6366F1'; // Indigo-600
      default:
        return DesignSystem.colors.neutral[700];
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Subtle radial overlay effect */}
        <View style={styles.overlay} />

        <View style={styles.content}>
          {/* Main Greeting */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={styles.greeting}>{greeting}</Text>
          </Animated.View>

          {/* User Name */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: nameSlideAnim }],
            }}
          >
            <Text style={[styles.userName, { color: getAccentColor() }]}>
              {userName}
            </Text>
          </Animated.View>

          {/* Decorative Line */}
          <Animated.View
            style={[
              styles.decorativeLine,
              {
                backgroundColor: `${getAccentColor()}33`, // 20% opacity
                transform: [{ scaleX: lineScaleAnim }],
              }
            ]}
          />

          {/* Subtitle */}
          <Animated.View style={{ opacity: subtitleFadeAnim }}>
            <Text style={styles.subtitle}>
              Welcome back to your wellness journey
            </Text>
          </Animated.View>
        </View>

        {/* Decorative blur circle (subtle background element) */}
        <View style={styles.decorativeCircle} />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: DesignSystem.radius['3xl'],
    overflow: 'hidden',
    ...DesignSystem.shadows.sm,
  },
  gradient: {
    paddingVertical: DesignSystem.spacing[10],
    paddingHorizontal: DesignSystem.spacing[8],
    borderRadius: DesignSystem.radius['3xl'],
    borderWidth: 1,
    borderColor: `${DesignSystem.colors.neutral[200]}50`, // 30% opacity
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: DesignSystem.radius['3xl'],
  },
  content: {
    position: 'relative',
    zIndex: 10,
  },
  greeting: {
    fontSize: 36,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[800],
    letterSpacing: -1,
    marginBottom: DesignSystem.spacing[2],
  },
  userName: {
    fontSize: 28,
    fontWeight: DesignSystem.typography.fontWeight.light,
    letterSpacing: 0.5,
    marginBottom: DesignSystem.spacing[6],
  },
  decorativeLine: {
    height: 1,
    width: 60,
    marginBottom: DesignSystem.spacing[5],
  },
  subtitle: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    letterSpacing: 0.3,
  },
  decorativeCircle: {
    position: 'absolute',
    right: -50,
    bottom: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.5,
  },
});

