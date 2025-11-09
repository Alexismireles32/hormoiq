import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';

interface CardFlipWrapperProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  style?: any;
  disabled?: boolean;
}

export function CardFlipWrapper({
  frontContent,
  backContent,
  style,
  disabled = false,
}: CardFlipWrapperProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const toValue = isFlipped ? 0 : 180;
    
    Animated.timing(flipAnimation, {
      toValue,
      duration: 800,
      easing: Easing.bezier(0.4, 0, 0.2, 1), // Smooth easing
      useNativeDriver: true,
    }).start();
    
    setIsFlipped(!isFlipped);
  };

  // Interpolate rotation for front and back
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  // Interpolate opacity for smooth transition
  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [0, 0, 1],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    opacity: frontOpacity,
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    opacity: backOpacity,
  };

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.95}
      onPress={flipCard}
      style={[styles.container, style]}
    >
      {/* Front Side */}
      <Animated.View
        style={[
          styles.cardFace,
          frontAnimatedStyle,
          { backfaceVisibility: 'hidden' as any },
        ]}
      >
        {frontContent}
      </Animated.View>

      {/* Back Side */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardBack,
          backAnimatedStyle,
          { backfaceVisibility: 'hidden' as any },
        ]}
      >
        {backContent}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  cardFace: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  cardBack: {
    backfaceVisibility: 'hidden' as any,
  },
});

