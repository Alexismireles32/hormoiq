import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';

export type CelebrationType = 'confetti' | 'sparkle' | 'glow' | 'badge';

interface ConfettiParticle {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  scale: Animated.Value;
  color: string;
}

interface CelebrationEffectProps {
  type: CelebrationType;
  trigger: boolean; // Set to true to trigger the celebration
  onComplete?: () => void;
  style?: any;
}

export function CelebrationEffect({
  type,
  trigger,
  onComplete,
  style,
}: CelebrationEffectProps) {
  const confettiParticles = useRef<ConfettiParticle[]>([]);
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      switch (type) {
        case 'confetti':
          triggerConfetti();
          break;
        case 'sparkle':
          triggerSparkle();
          break;
        case 'glow':
          triggerGlow();
          break;
        case 'badge':
          triggerBadge();
          break;
      }
    }
  }, [trigger, type]);

  const triggerConfetti = () => {
    // Create 30 confetti particles
    const particles: ConfettiParticle[] = [];
    for (let i = 0; i < 30; i++) {
      const particle: ConfettiParticle = {
        x: new Animated.Value(Math.random() * 300 - 150),
        y: new Animated.Value(-100),
        rotate: new Animated.Value(0),
        scale: new Animated.Value(1),
        color: DesignSystem.colors.celebration.confetti[
          Math.floor(Math.random() * DesignSystem.colors.celebration.confetti.length)
        ],
      };
      particles.push(particle);

      // Animate each particle
      Animated.parallel([
        Animated.timing(particle.y, {
          toValue: 600,
          duration: 2000 + Math.random() * 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(particle.rotate, {
          toValue: 360 * 4,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: 1.5,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (i === particles.length - 1 && onComplete) {
          onComplete();
        }
      });
    }
    confettiParticles.current = particles;
  };

  const triggerSparkle = () => {
    Animated.sequence([
      Animated.timing(sparkleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sparkleAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) onComplete();
    });
  };

  const triggerGlow = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto-stop after 3 cycles
    setTimeout(() => {
      glowAnim.stopAnimation();
      if (onComplete) onComplete();
    }, 6000);
  };

  const triggerBadge = () => {
    Animated.sequence([
      Animated.spring(badgeAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(badgeAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) onComplete();
    });
  };

  const renderConfetti = () => {
    return confettiParticles.current.map((particle, index) => (
      <Animated.View
        key={index}
        style={[
          styles.confettiParticle,
          {
            backgroundColor: particle.color,
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              {
                rotate: particle.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }),
              },
              { scale: particle.scale },
            ],
          },
        ]}
      />
    ));
  };

  const renderSparkle = () => {
    return (
      <Animated.View
        style={[
          styles.sparkleContainer,
          {
            opacity: sparkleAnim,
            transform: [
              {
                scale: sparkleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 2],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.sparkle}>
          <View style={[styles.sparkleRay, { transform: [{ rotate: '0deg' }] }]} />
          <View style={[styles.sparkleRay, { transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.sparkleRay, { transform: [{ rotate: '90deg' }] }]} />
          <View style={[styles.sparkleRay, { transform: [{ rotate: '135deg' }] }]} />
        </View>
      </Animated.View>
    );
  };

  const renderGlow = () => {
    return (
      <Animated.View
        style={[
          styles.glowContainer,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.8],
            }),
            transform: [
              {
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.glow} />
      </Animated.View>
    );
  };

  const renderBadge = () => {
    return (
      <Animated.View
        style={[
          styles.badgeContainer,
          {
            opacity: badgeAnim,
            transform: [
              {
                scale: badgeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
              {
                rotate: badgeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.badge}>
          <View style={styles.badgeStar}>⭐</View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {type === 'confetti' && renderConfetti()}
      {type === 'sparkle' && renderSparkle()}
      {type === 'glow' && renderGlow()}
      {type === 'badge' && renderBadge()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: DesignSystem.zIndex.modal,
  },
  confettiParticle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  sparkleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleRay: {
    position: 'absolute',
    width: 4,
    height: 30,
    backgroundColor: DesignSystem.colors.celebration.sparkle,
    borderRadius: 2,
  },
  glowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: DesignSystem.colors.celebration.glow,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignSystem.shadows.lg,
  },
  badgeStar: {
    fontSize: 40,
  },
});

