import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import * as Haptics from 'expo-haptics';

export type EmptyStateType = 
  | 'no_tests'
  | 'no_data'
  | 'feature_locked'
  | 'coming_soon'
  | 'error'
  | 'offline';

interface EmptyStateIllustrationProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  secondaryActionLabel?: string;
  onSecondaryActionPress?: () => void;
}

const DEFAULT_CONTENT = {
  no_tests: {
    icon: '🧪',
    title: 'No Tests Yet',
    description: 'Start tracking your hormone levels to unlock personalized insights and recommendations.',
  },
  no_data: {
    icon: '📊',
    title: 'No Data Available',
    description: 'Add more tests to see trends and patterns in your hormone levels.',
  },
  feature_locked: {
    icon: '🔒',
    title: 'Feature Locked',
    description: 'Complete a few more tests to unlock this feature and get deeper insights.',
  },
  coming_soon: {
    icon: '🚀',
    title: 'Coming Soon',
    description: 'We\'re working on something amazing. Stay tuned!',
  },
  error: {
    icon: '⚠️',
    title: 'Something Went Wrong',
    description: 'We couldn\'t load this data. Please try again.',
  },
  offline: {
    icon: '📡',
    title: 'You\'re Offline',
    description: 'Check your internet connection and try again.',
  },
};

export function EmptyStateIllustration({
  type,
  title,
  description,
  icon,
  actionLabel,
  onActionPress,
  secondaryActionLabel,
  onSecondaryActionPress,
}: EmptyStateIllustrationProps) {
  const content = DEFAULT_CONTENT[type];
  const displayTitle = title || content.title;
  const displayDescription = description || content.description;
  const displayIcon = icon || content.icon;

  const handleActionPress = () => {
    if (onActionPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onActionPress();
    }
  };

  const handleSecondaryActionPress = () => {
    if (onSecondaryActionPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSecondaryActionPress();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{displayIcon}</Text>
      </View>
      
      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.description}>{displayDescription}</Text>

      {actionLabel && onActionPress && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleActionPress}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}

      {secondaryActionLabel && onSecondaryActionPress && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSecondaryActionPress}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: DesignSystem.spacing[8],
    minHeight: 300,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: DesignSystem.radius.full,
    backgroundColor: DesignSystem.colors.oura.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignSystem.spacing[6],
  },
  icon: {
    fontSize: DesignSystem.iconSize['2xl'],
  },
  title: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.neutral[900],
    textAlign: 'center',
    marginBottom: DesignSystem.spacing[3],
  },
  description: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.light,
    color: DesignSystem.colors.neutral[600],
    textAlign: 'center',
    lineHeight: DesignSystem.typography.fontSize.base * 1.6,
    marginBottom: DesignSystem.spacing[8],
    maxWidth: 300,
  },
  primaryButton: {
    backgroundColor: DesignSystem.colors.primary[500],
    paddingVertical: DesignSystem.spacing[4],
    paddingHorizontal: DesignSystem.spacing[8],
    borderRadius: DesignSystem.radius.full,
    minWidth: 200,
    alignItems: 'center',
    minHeight: DesignSystem.touchTarget.comfortable,
    justifyContent: 'center',
    ...DesignSystem.shadows.md,
  },
  primaryButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.neutral[0],
  },
  secondaryButton: {
    marginTop: DesignSystem.spacing[3],
    paddingVertical: DesignSystem.spacing[3],
    paddingHorizontal: DesignSystem.spacing[6],
    minHeight: DesignSystem.touchTarget.minimum,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.primary[500],
  },
});

