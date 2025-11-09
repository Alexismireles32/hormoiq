/**
 * HormoIQ Design System
 * Single source of truth for all design tokens
 * Professional, minimalistic, mobile-first
 */

export const DesignSystem = {
  // ============================================
  // COLOR PALETTE - Modern & Accessible
  // ============================================
  colors: {
    // Primary Brand - Soft Lavender (Oura-inspired)
    primary: {
      50: '#F5F3F9',
      100: '#EBE7F3',
      200: '#D7CFE7',
      300: '#C3B7DB',
      400: '#AF9FCF',
      500: '#9B8DC7',  // Main brand color - soft lavender
      600: '#8A7BB8',
      700: '#786BA3',
      800: '#655A8A',
      900: '#524871',
      950: '#3F3658',
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
    },
    
    // Solid Colors (No Gradients - Oura style)
    gradients: {
      primary: ['#9B8DC7', '#9B8DC7'],
      success: ['#7FB5A5', '#7FB5A5'],
      sunset: ['#D4A574', '#D4A574'],
      ocean: ['#8E9FBC', '#8E9FBC'],
      rainbow: ['#9B8DC7', '#9B8DC7'],
    },
    
    // Oura-specific Design Tokens
    oura: {
      cardBackground: '#FFFFFF',
      cardBorder: '#E8E9EC',
      subtleBackground: '#F5F6F8',
      divider: '#EDEEF1',
    },
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
  // TYPOGRAPHY - Perfect Scale
  // ============================================
  typography: {
    // Font Sizes (1.25 scale for harmony)
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
      '6xl': 60,
    },
    
    // Font Weights - Light & Elegant (Oura-inspired)
    fontWeight: {
      light: '300' as any,
      regular: '400' as any,
      medium: '500' as any,
      semibold: '600' as any,
      bold: '700' as any,
      extrabold: '800' as any,
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
      fast: 150,
      normal: 250,
      slow: 350,
      slower: 500,
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
  // COMPONENTS - Pre-defined Styles
  // ============================================
  components: {
    // Card variants
    card: {
      base: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      },
      compact: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
      flat: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
      },
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

