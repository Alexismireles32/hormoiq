import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { createCardEntranceAnimation } from '@/lib/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  index: number; // For stagger effect
  style?: StyleProp<ViewStyle>;
  delay?: number; // Additional delay
}

/**
 * Card component with entrance animation
 * Automatically animates in with a stagger effect based on index
 */
export function AnimatedCard({ children, index, style, delay = 0 }: AnimatedCardProps) {
  const animation = useRef(createCardEntranceAnimation(index)).current;

  useEffect(() => {
    // Delay the animation if specified
    if (delay > 0) {
      const timer = setTimeout(() => {
        animation.animate();
      }, delay);
      return () => clearTimeout(timer);
    } else {
      animation.animate();
    }
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: animation.opacity,
          transform: [{ translateY: animation.translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

