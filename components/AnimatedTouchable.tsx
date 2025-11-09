import React, { useRef } from 'react';
import { Animated, TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';

interface AnimatedTouchableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleValue?: number; // Default 0.96
  hapticFeedback?: boolean; // Default true
  hapticStyle?: Haptics.ImpactFeedbackStyle;
}

/**
 * Touchable component with built-in press animation and haptic feedback
 * Provides consistent micro-interactions throughout the app
 */
export function AnimatedTouchable({
  children,
  onPress,
  style,
  scaleValue = 0.96,
  hapticFeedback = true,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  ...props
}: AnimatedTouchableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(hapticStyle);
    }
    Animated.timing(scale, {
      toValue: scaleValue,
      duration: DesignSystem.animation.duration.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 10,
      stiffness: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1} // We handle opacity via scale
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

