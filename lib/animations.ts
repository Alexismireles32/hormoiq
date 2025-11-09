import { Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DesignSystem } from '@/constants/DesignSystem';

/**
 * Standard animation presets for consistent micro-interactions
 */

// Scale animations for press feedback
export const scalePress = (animatedValue: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 0.95,
      duration: DesignSystem.animation.duration.fast,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      damping: 10,
      stiffness: 100,
      useNativeDriver: true,
    }),
  ]);
};

// Subtle pulse animation for attention
export const pulse = (animatedValue: Animated.Value, loops: number = -1) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.05,
        duration: DesignSystem.animation.duration.normal,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: DesignSystem.animation.duration.normal,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]),
    { iterations: loops }
  );
};

// Fade in animation
export const fadeIn = (animatedValue: Animated.Value, duration?: number) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration: duration || DesignSystem.animation.duration.normal,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

// Fade out animation
export const fadeOut = (animatedValue: Animated.Value, duration?: number) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration: duration || DesignSystem.animation.duration.normal,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  });
};

// Slide in from bottom
export const slideInFromBottom = (animatedValue: Animated.Value, distance: number = 50) => {
  return Animated.spring(animatedValue, {
    toValue: 0,
    damping: 15,
    stiffness: 100,
    useNativeDriver: true,
  });
};

// Slide out to bottom
export const slideOutToBottom = (animatedValue: Animated.Value, distance: number = 50) => {
  return Animated.timing(animatedValue, {
    toValue: distance,
    duration: DesignSystem.animation.duration.fast,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  });
};

// Bounce animation
export const bounce = (animatedValue: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 0.9,
      duration: DesignSystem.animation.duration.fast,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      damping: 5,
      stiffness: 100,
      useNativeDriver: true,
    }),
  ]);
};

// Shake animation for errors
export const shake = (animatedValue: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]);
};

// Stagger animation for lists
export const stagger = (
  animations: Animated.CompositeAnimation[],
  staggerDelay: number = 100
) => {
  return Animated.stagger(staggerDelay, animations);
};

/**
 * Haptic feedback helpers with smart timing
 */

export const hapticWithAnimation = async (
  animation: Animated.CompositeAnimation,
  hapticType: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
) => {
  await Haptics.impactAsync(hapticType);
  animation.start();
};

export const hapticSuccess = () => {
  return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const hapticError = () => {
  return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

export const hapticWarning = () => {
  return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

export const hapticSelection = () => {
  return Haptics.selectionAsync();
};

/**
 * Animated touchable wrapper for consistent press feedback
 */
export const createAnimatedPress = () => {
  const scale = new Animated.Value(1);

  const onPressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(scale, {
      toValue: 0.96,
      duration: DesignSystem.animation.duration.fast,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 10,
      stiffness: 100,
      useNativeDriver: true,
    }).start();
  };

  return { scale, onPressIn, onPressOut };
};

/**
 * Card entrance animation with stagger
 */
export const createCardEntranceAnimation = (index: number) => {
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(30);

  const animate = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: DesignSystem.animation.duration.normal,
        delay: index * 100, // Stagger based on index
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: DesignSystem.animation.duration.normal,
        delay: index * 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { opacity, translateY, animate };
};

/**
 * Loading spinner animation
 */
export const createSpinAnimation = () => {
  const rotation = new Animated.Value(0);

  const spin = Animated.loop(
    Animated.timing(rotation, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return { rotation, spin, rotateInterpolate };
};

/**
 * Number counter animation
 */
export const animateNumber = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = DesignSystem.animation.duration.normal
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: Easing.out(Easing.ease),
    useNativeDriver: false, // Numbers can't use native driver
  });
};

/**
 * Success celebration animation
 */
export const celebrationAnimation = (scale: Animated.Value, opacity: Animated.Value) => {
  return Animated.parallel([
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: DesignSystem.animation.duration.fast,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 8,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]),
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: DesignSystem.animation.duration.fast,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(opacity, {
        toValue: 0,
        duration: DesignSystem.animation.duration.slow,
        useNativeDriver: true,
      }),
    ]),
  ]);
};

