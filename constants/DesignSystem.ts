/**
 * HormoIQ Design System - Eli Health Inspired
 * Single source of truth for all design tokens
 * Soft, minimal, gradient-focused, mobile-first
 */

export const DesignSystem = {
  // ============================================
  // COLOR PALETTE - Eli Health Inspired
  // ============================================
  colors: {
    // Primary Brand - Soft pastels for a wellness feel
    primary: {
      50: '#F0F4FF',
      100: '#E0E9FF',
      200: '#C7D8FF',
      300: '#A4BFFF',
      400: '#869EFF',
      500: '#6B7FFF',  // Main brand color - soft blue
      600: '#5563E5',
      700: '#4350CC',
      800: '#3540A3',
      900: '#2A3381',
      950: '#1F2660',
    },
    
    // Neutrals - Soft gray scale with warmth (Oura-inspired)
    neutral: {
      0: '#FFFFFF',
      50: '#F9FAFB',     // Off-white/cream - main background
      100: '#F5F6F8',
      200: '#EDEEF1',
      300: '#E8E9EC',    // Card borders
      400: '#C8CACD',
      500: '#9B9DA2',
      600: '#6B7280',
      700: '#4B5563',
      800: '#374151',
      900: '#1F2937',
      950: '#111827',
    },
    
    // Semantic Colors - Soft Monotone (Oura-inspired)
    success: {
      light: '#E8F4F0',
      DEFAULT: '#7FB5A5',
      dark: '#6BA393',
    },
    warning: {
      light: '#FFF4E6',
      DEFAULT: '#D4A574',
      dark: '#BF9463',
    },
    error: {
      light: '#FDEAEA',
      DEFAULT: '#D88B8B',
      dark: '#C67878',
    },
    info: {
      light: '#E9EEF7',
      DEFAULT: '#8E9FBC',
      dark: '#7A8CAA',
    },
    
    // Hormone-specific Colors - Soft Pastels
    hormones: {
      cortisol: '#8E9FBC',      // Soft blue-gray
      testosterone: '#C4A6A6',   // Soft rose
      dhea: '#D4A574',          // Soft amber
      progesterone: '#A8B5D4',   // Soft lavender
    },
    
    // Soft Gradient Backgrounds - Eli Health Style
    gradients: {
      // Blurred background gradients (like Eli's screens)
      yellowBlur: ['#FFFBEB', '#FEF3C7', '#FDE68A'],  // Soft yellow
      purpleBlur: ['#FAF5FF', '#F3E8FF', '#E9D5FF'],  // Soft purple
      blueBlur: ['#EFF6FF', '#DBEAFE', '#BFDBFE'],    // Soft blue
      greenBlur: ['#F0FDF4', '#DCFCE7', '#BBF7D0'],   // Soft green
      pinkBlur: ['#FFF1F2', '#FFE4E6', '#FECDD3'],    // Soft pink
      
      // Pastel accent gradients
      cortisolGradient: ['#DBEAFE', '#BFDBFE'],       // Blue for cortisol
      progesteroneGradient: ['#DCFCE7', '#BBF7D0'],   // Green for progesterone
      testosteroneGradient: ['#FED7AA', '#FDBA74'],   // Orange for testosterone
      
      // Multi-color blur (like Eli's dashboard)
      multiBlur: [
        'rgba(254, 243, 199, 0.6)',  // Yellow
        'rgba(243, 232, 255, 0.6)',  // Purple
        'rgba(191, 219, 254, 0.6)',  // Blue
        'rgba(187, 247, 208, 0.6)',  // Green
      ],
    },
    
    // Celebration colors
    celebration: {
      confetti: ['#f472b6', '#fb7185', '#c084fc', '#a78bfa', '#60a5fa', '#34d399'],
      sparkle: '#fbbf24',
      glow: 'rgba(251, 191, 36, 0.4)',
    },
    
    // Chart colors (keeping existing for consistency)
    charts: {
      cortisol: '#8E9FBC',
      testosterone: '#C4A6A6',
      dhea: '#D4A574',
      progesterone: '#A8B5D4',
    },
    
    // Oura-specific Design Tokens
    oura: {
      cardBackground: '#FFFFFF',
      cardBorder: '#E8E9EC',
      subtleBackground: '#F5F6F8',
      divider: '#EDEEF1',
    },
    
    // Text Colors
    text: {
      primary: '#1F2937',      // Dark gray for main text
      secondary: '#6B7280',    // Medium gray for secondary text
      tertiary: '#9B9DA2',     // Light gray for tertiary text
    },
    
    // Background & Surface Colors
    background: '#F9FAFB',     // Off-white main background
    surface: '#FFFFFF',        // White cards/surfaces
    errorBackground: '#FDEAEA', // Light red for error states
  },
  
  // ============================================
  // DARK MODE COLORS
  // ============================================
  dark: {
    colors: {
      background: {
        primary: '#0F1419',      // Deep dark
        secondary: '#1A1F26',    // Card background
        tertiary: '#252D37',     // Elevated elements
        quaternary: '#2D3642',   // Hover states
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#8B95A1',
        tertiary: '#5F6B7A',
      },
      border: {
        subtle: 'rgba(255, 255, 255, 0.08)',
        medium: 'rgba(255, 255, 255, 0.12)',
        strong: 'rgba(255, 255, 255, 0.16)',
      },
    },
  },
  
  // ============================================
  // TYPOGRAPHY - Eli Health Style (Ultra-light, minimal)
  // ============================================
  typography: {
    // Font Sizes
    fontSize: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 34,
      '5xl': 48,
      '6xl': 64,
      '7xl': 80,   // For large numbers like in Eli
    },
    
    // Font Weights - Ultra-light emphasis (Eli style)
    fontWeight: {
      ultralight: '100' as any,  // For large numbers
      thin: '200' as any,         // For headings
      light: '300' as any,
      regular: '400' as any,
      medium: '500' as any,
      semibold: '600' as any,
      bold: '700' as any,
      extrabold: '800' as any,
    },
    
    // Font Families - Serif for marketing, sans for UI
    fontFamily: {
      sans: 'System',           // System font for UI
      serif: 'Georgia',         // Serif for marketing copy
      mono: 'Courier',          // Monospace for numbers
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    
    // Letter Spacing
    letterSpacing: {
      tighter: -2,
      tight: -1,
      normal: 0,
      wide: 0.5,
      wider: 1,
    },
  },
  
  // ============================================
  // SPACING SCALE - Multiples of 4
  // ============================================
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  },
  
  // ============================================
  // BORDER RADIUS - Consistent Curves
  // ============================================
  radius: {
    none: 0,
    sm: 4,
    DEFAULT: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    full: 9999,
  },
  
  // ============================================
  // SHADOWS - Subtle Elevation (Oura-inspired)
  // ============================================
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 1,
    },
    DEFAULT: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.05,
      shadowRadius: 16,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.06,
      shadowRadius: 20,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 5,
    },
    '2xl': {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.1,
      shadowRadius: 32,
      elevation: 6,
    },
  },
  
  // ============================================
  // ANIMATION - Timing & Easing
  // ============================================
  animation: {
    duration: {
      instant: 100,
      fast: 150,
      normal: 250,
      slow: 350,
      slower: 500,
      slowest: 700,
    },
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      spring: 'spring',
    },
  },
  
  // ============================================
  // TOUCH TARGETS - Accessibility Standards
  // ============================================
  touchTarget: {
    minimum: 44,  // WCAG minimum touch target size
    comfortable: 48,
    large: 56,
    xlarge: 64,
  },
  
  // ============================================
  // ICON SIZES - Consistent Scaling
  // ============================================
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    '2xl': 48,
    '3xl': 64,
  },
  
  // ============================================
  // Z-INDEX - Stacking Order
  // ============================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    notification: 1700,
  },
  
  // ============================================
  // LAYOUT - Breakpoints & Constraints
  // ============================================
  layout: {
    // Breakpoints
    breakpoints: {
      mobile: 0,
      tablet: 768,
      desktop: 1024,
    },
    
    // Max widths for content
    maxWidth: {
      mobile: '100%',
      tablet: 600,
      content: 800,
    },
    
    // Safe area padding
    safeArea: {
      top: 60,
      bottom: 24,
      horizontal: 24,
    },
  },
  
  // ============================================
  // COMPONENTS - Eli Health Inspired Styles
  // ============================================
  components: {
    // Card variants - Minimal shadows, clean whites
    card: {
      base: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
      compact: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
      },
      flat: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
      },
    },
    
    // Circular Progress (Eli style - thin stroke)
    circularProgress: {
      strokeWidth: 2,
      size: 180,
      backgroundColor: '#F3F4F6',
      foregroundColor: '#000000',
    },
    
    // Pill badges (for health journal tags)
    pill: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    
    // Active pill (selected state)
    pillActive: {
      backgroundColor: '#000000',
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#000000',
    },
    
    // Button variants
    button: {
      primary: {
        height: 56,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center' as any,
        justifyContent: 'center' as any,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
      },
      secondary: {
        height: 56,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center' as any,
        justifyContent: 'center' as any,
      },
      ghost: {
        height: 56,
        paddingHorizontal: 24,
        borderRadius: 16,
        borderWidth: 1.5,
        alignItems: 'center' as any,
        justifyContent: 'center' as any,
      },
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get responsive value based on screen width
 */
export const getResponsiveValue = (width: number, mobile: any, tablet: any) => {
  return width >= DesignSystem.layout.breakpoints.tablet ? tablet : mobile;
};

/**
 * Get shadow style for specific elevation
 */
export const getShadow = (elevation: 'none' | 'sm' | 'DEFAULT' | 'md' | 'lg' | 'xl' | '2xl' = 'DEFAULT') => {
  return DesignSystem.shadows[elevation];
};

/**
 * Get spacing value
 */
export const spacing = (multiplier: keyof typeof DesignSystem.spacing) => {
  return DesignSystem.spacing[multiplier];
};

/**
 * Create gradient colors array
 */
export const getGradient = (type: keyof typeof DesignSystem.colors.gradients) => {
  return DesignSystem.colors.gradients[type];
};

// Export for easy access
export const { colors, typography, shadows, radius, animation } = DesignSystem;

