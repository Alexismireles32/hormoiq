import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type CelebrationType = 
  | 'test_logged'
  | 'milestone'
  | 'feature_unlocked'
  | 'streak'
  | 'level_up';

interface CelebrationProps {
  visible: boolean;
  type: CelebrationType;
  title?: string;
  message?: string;
  onClose: () => void;
}

const CELEBRATION_CONTENT = {
  test_logged: {
    emoji: '🎉',
    defaultTitle: 'Test Logged!',
    defaultMessage: 'Your data has been recorded successfully.',
    color: DesignSystem.colors.success.DEFAULT,
  },
  milestone: {
    emoji: '🏆',
    defaultTitle: 'Milestone Reached!',
    defaultMessage: 'You\'ve hit an important goal. Keep it up!',
    color: DesignSystem.colors.warning.DEFAULT,
  },
  feature_unlocked: {
    emoji: '🔓',
    defaultTitle: 'Feature Unlocked!',
    defaultMessage: 'You\'ve unlocked a new insight tool.',
    color: DesignSystem.colors.primary[500],
  },
  streak: {
    emoji: '🔥',
    defaultTitle: 'Streak Active!',
    defaultMessage: 'You\'re on a roll. Don\'t break the chain!',
    color: DesignSystem.colors.error.DEFAULT,
  },
  level_up: {
    emoji: '⭐',
    defaultTitle: 'Level Up!',
    defaultMessage: 'You\'ve reached a new level of tracking.',
    color: DesignSystem.colors.info.DEFAULT,
  },
};

export function Celebration({
  visible,
  type,
  title,
  message,
  onClose,
}: CelebrationProps) {
  const content = CELEBRATION_CONTENT[type];
  const displayTitle = title || content.defaultTitle;
  const displayMessage = message || content.defaultMessage;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 15 }).map(() => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate modal entrance
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate confetti
      confettiAnims.forEach((anim, index) => {
        const delay = index * 50;
        const randomX = (Math.random() - 0.5) * SCREEN_WIDTH;
        const randomRotation = Math.random() * 720;

        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 2000 + Math.random() * 1000,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: randomX,
            duration: 2000 + Math.random() * 1000,
            delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: randomRotation,
            duration: 2000 + Math.random() * 1000,
            delay,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 2000,
            delay: delay + 500,
            useNativeDriver: true,
          }),
        ]).start();
      });

      // Auto close after animation
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      confettiAnims.forEach(anim => {
        anim.translateY.setValue(0);
        anim.translateX.setValue(0);
        anim.rotate.setValue(0);
        anim.opacity.setValue(1);
      });
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  const confettiColors = [
    DesignSystem.colors.primary[500],
    DesignSystem.colors.success.DEFAULT,
    DesignSystem.colors.warning.DEFAULT,
    DesignSystem.colors.error.DEFAULT,
    DesignSystem.colors.info.DEFAULT,
  ];

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        {/* Confetti */}
        {confettiAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                backgroundColor: confettiColors[index % confettiColors.length],
                transform: [
                  { translateY: anim.translateY },
                  { translateX: anim.translateX },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}

        {/* Celebration Card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={[styles.emojiContainer, { backgroundColor: content.color + '20' }]}>
            <Text style={styles.emoji}>{content.emoji}</Text>
          </View>

          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.message}>{displayMessage}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: content.color }]}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Quick celebration toast (non-blocking)
interface CelebrationToastProps {
  visible: boolean;
  message: string;
  emoji?: string;
  duration?: number;
  onClose: () => void;
}

export function CelebrationToast({
  visible,
  message,
  emoji = '✨',
  duration = 2000,
  onClose,
}: CelebrationToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(onClose);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Text style={styles.toastEmoji}>{emoji}</Text>
      <Text style={styles.toastMessage}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing[6],
  },
  card: {
    backgroundColor: DesignSystem.colors.neutral[0],
    borderRadius: DesignSystem.radius['2xl'],
    padding: DesignSystem.spacing[8],
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...DesignSystem.shadows.xl,
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: DesignSystem.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing[6],
  },
  emoji: {
    fontSize: DesignSystem.iconSize['3xl'],
  },
  title: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.neutral[900],
    marginBottom: DesignSystem.spacing[3],
    textAlign: 'center',
  },
  message: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    lineHeight: DesignSystem.typography.fontSize.base * 1.6,
    marginBottom: DesignSystem.spacing[6],
  },
  button: {
    paddingVertical: DesignSystem.spacing[4],
    paddingHorizontal: DesignSystem.spacing[8],
    borderRadius: DesignSystem.radius.full,
    minWidth: 200,
    minHeight: DesignSystem.touchTarget.comfortable,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignSystem.shadows.md,
  },
  buttonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[0],
  },
  confetti: {
    position: 'absolute',
    top: -20,
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: DesignSystem.spacing[6],
    right: DesignSystem.spacing[6],
    backgroundColor: DesignSystem.colors.neutral[900],
    borderRadius: DesignSystem.radius.lg,
    padding: DesignSystem.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing[3],
    ...DesignSystem.shadows.lg,
    zIndex: DesignSystem.zIndex.notification,
  },
  toastEmoji: {
    fontSize: DesignSystem.iconSize.lg,
  },
  toastMessage: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[0],
  },
});

