import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
  gradient = false,
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: DesignSystem.radius.lg,
      ...DesignSystem.shadows.DEFAULT,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        height: 40,
        paddingHorizontal: 16,
      },
      medium: {
        height: 56,
        paddingHorizontal: 24,
      },
      large: {
        height: 64,
        paddingHorizontal: 32,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: DesignSystem.colors.primary[500],
        ...DesignSystem.shadows.md,
      },
      secondary: {
        backgroundColor: DesignSystem.colors.neutral[100],
        ...DesignSystem.shadows.sm,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: DesignSystem.colors.neutral[300],
        shadowColor: 'transparent',
        elevation: 0,
      },
      danger: {
        backgroundColor: DesignSystem.colors.error.DEFAULT,
        ...DesignSystem.shadows.md,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.5 }),
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      small: {
        fontSize: DesignSystem.typography.fontSize.sm,
      },
      medium: {
        fontSize: DesignSystem.typography.fontSize.base,
      },
      large: {
        fontSize: DesignSystem.typography.fontSize.lg,
      },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: {
        color: DesignSystem.colors.neutral[0],
      },
      secondary: {
        color: DesignSystem.colors.neutral[900],
      },
      ghost: {
        color: DesignSystem.colors.neutral[700],
      },
      danger: {
        color: DesignSystem.colors.neutral[0],
      },
    };

    return {
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  const buttonContent = (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' || variant === 'danger'
              ? DesignSystem.colors.neutral[0]
              : DesignSystem.colors.neutral[900]
          }
          style={{ marginRight: 8 }}
        />
      )}
      {!loading && icon && <>{icon}</>}
      <Text style={getTextStyle()}>{children}</Text>
    </>
  );

  if (gradient && variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[getButtonStyle(), { overflow: 'hidden' }]}
      >
        <LinearGradient
          colors={DesignSystem.colors.gradients.primary as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        />
        {buttonContent}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={getButtonStyle()}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});

