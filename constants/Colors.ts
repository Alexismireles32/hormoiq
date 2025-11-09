import { DesignSystem } from './DesignSystem';

const tintColorLight = DesignSystem.colors.primary[500];
const tintColorDark = DesignSystem.colors.primary[400];

export default {
  light: {
    text: DesignSystem.colors.neutral[900],
    textSecondary: DesignSystem.colors.neutral[600],
    textTertiary: DesignSystem.colors.neutral[500],
    background: DesignSystem.colors.neutral[0],
    backgroundSecondary: DesignSystem.colors.neutral[50],
    card: DesignSystem.colors.neutral[0],
    border: DesignSystem.colors.neutral[200],
    borderLight: DesignSystem.colors.neutral[100],
    tint: tintColorLight,
    tabIconDefault: DesignSystem.colors.neutral[400],
    tabIconSelected: tintColorLight,
    primary: DesignSystem.colors.primary[500],
    success: DesignSystem.colors.success.DEFAULT,
    warning: DesignSystem.colors.warning.DEFAULT,
    error: DesignSystem.colors.error.DEFAULT,
    info: DesignSystem.colors.info.DEFAULT,
  },
  dark: {
    text: DesignSystem.dark.colors.text.primary,
    textSecondary: DesignSystem.dark.colors.text.secondary,
    textTertiary: DesignSystem.dark.colors.text.tertiary,
    background: DesignSystem.dark.colors.background.primary,
    backgroundSecondary: DesignSystem.dark.colors.background.secondary,
    card: DesignSystem.dark.colors.background.secondary,
    border: DesignSystem.dark.colors.border.medium,
    borderLight: DesignSystem.dark.colors.border.subtle,
    tint: tintColorDark,
    tabIconDefault: DesignSystem.colors.neutral[600],
    tabIconSelected: tintColorDark,
    primary: DesignSystem.colors.primary[400],
    success: DesignSystem.colors.success.DEFAULT,
    warning: DesignSystem.colors.warning.DEFAULT,
    error: DesignSystem.colors.error.DEFAULT,
    info: DesignSystem.colors.info.DEFAULT,
  },
};
