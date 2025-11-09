import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';

interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  gradient?: string[];
}

export function FloatingActionButton({
  icon,
  onPress,
  position = 'bottom-right',
  gradient = DesignSystem.colors.gradients.primary,
}: FloatingActionButtonProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Rotation animation on press
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const getPositionStyle = () => {
    const basePosition = {
      bottom: DesignSystem.spacing[8],
    };

    switch (position) {
      case 'bottom-right':
        return { ...basePosition, right: DesignSystem.spacing[8] };
      case 'bottom-left':
        return { ...basePosition, left: DesignSystem.spacing[8] };
      case 'bottom-center':
        return { ...basePosition, alignSelf: 'center' as any };
      default:
        return { ...basePosition, right: DesignSystem.spacing[8] };
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyle(),
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Animated.Text
            style={[
              styles.icon,
              {
                transform: [{ rotate: rotation }],
              },
            ]}
          >
            {icon}
          </Animated.Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Shadow glow effect */}
      <View style={styles.shadow} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: DesignSystem.zIndex.fixed,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignSystem.shadows.xl,
  },
  icon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  shadow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    top: 4,
    left: 0,
    zIndex: -1,
    ...DesignSystem.shadows['2xl'],
  },
});

