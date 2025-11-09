# 🎨 Gradient Background Components - Usage Guide

## Overview

Two React Native gradient background components have been created as an alternative to the web-based mesh gradient shader component you provided. These are optimized for React Native/Expo and provide beautiful, performant backgrounds.

---

## 🚫 Why Not Use the Original Component?

The original `hero-section-with-smooth-bg-shader.tsx` component **cannot be used** in React Native because:

1. **Tailwind CSS** - React Native doesn't support Tailwind (uses StyleSheet API)
2. **@paper-design/shaders-react** - Web-only library, requires WebGL/Canvas (not available in React Native)
3. **DOM elements** - Uses browser-specific APIs not available in mobile
4. **MeshGradient shaders** - Requires WebGL which React Native doesn't support

---

## ✅ React Native Alternatives Created

### 1. `AnimatedBackground` - Smooth Animated Gradients

**File**: `components/AnimatedBackground.tsx`

**Best For**: 
- Splash screens
- Onboarding flows
- Featured content screens
- Places where you want a "wow" factor

**Performance**: Moderate (uses animations)

**Usage**:
```tsx
import AnimatedBackground from '@/components/AnimatedBackground';

// Basic usage
<AnimatedBackground>
  <YourContent />
</AnimatedBackground>

// With variants
<AnimatedBackground variant="wellness" intensity="medium">
  <YourContent />
</AnimatedBackground>

// Without animation (static)
<AnimatedBackground animate={false} variant="calm">
  <YourContent />
</AnimatedBackground>
```

**Variants**:
- `default` - Off-white with subtle tints
- `wellness` - Teal, peach, mint (perfect for health apps)
- `calm` - Sky blue, lavender
- `energetic` - Amber, gold tones
- `night` - Indigo, purple

**Intensity**: `subtle` | `medium` | `bold`

---

### 2. `GradientBackground` - Static Gradients (Recommended)

**File**: `components/GradientBackground.tsx`

**Best For**:
- All regular screens (dashboard, profile, settings)
- Any scrollable content
- Where performance is critical

**Performance**: Excellent (no animations)

**Usage**:
```tsx
import GradientBackground from '@/components/GradientBackground';

// Basic usage
<GradientBackground>
  <YourContent />
</GradientBackground>

// Time-aware (like your greeting)
<GradientBackground variant="morning" intensity="subtle">
  <YourContent />
</GradientBackground>
```

**Variants**:
- `default` - Very subtle off-white
- `wellness` - Teal, peach
- `calm` - Blue, lavender
- `energetic` - Amber, gold
- `night` - Indigo, purple
- `morning` - Warm amber sunrise
- `afternoon` - Cool blue
- `evening` - Purple twilight

---

## 📱 Integration Examples

### Example 1: Dashboard with Time-Aware Background

```tsx
// app/(tabs)/index.tsx
import GradientBackground from '@/components/GradientBackground';

export default function DashboardScreen() {
  const getTimeVariant = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <GradientBackground variant={getTimeVariant()} intensity="subtle">
      <ScrollView>
        {/* Your dashboard content */}
      </ScrollView>
    </GradientBackground>
  );
}
```

### Example 2: Onboarding with Animated Background

```tsx
// app/(onboarding)/index.tsx
import AnimatedBackground from '@/components/AnimatedBackground';

export default function OnboardingScreen() {
  return (
    <AnimatedBackground variant="wellness" intensity="medium">
      <View>
        {/* Onboarding steps */}
      </View>
    </AnimatedBackground>
  );
}
```

### Example 3: ASK AI with Calm Background

```tsx
// app/(tabs)/ask.tsx
import GradientBackground from '@/components/GradientBackground';

export default function AskScreen() {
  return (
    <GradientBackground variant="calm" intensity="subtle">
      <KeyboardAvoidingView>
        {/* AI chat interface */}
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
```

### Example 4: Profile with Default Background

```tsx
// app/(tabs)/profile.tsx
import GradientBackground from '@/components/GradientBackground';

export default function ProfileScreen() {
  return (
    <GradientBackground variant="default" intensity="subtle">
      <ScrollView>
        {/* Profile content */}
      </ScrollView>
    </GradientBackground>
  );
}
```

---

## 🎨 Color Palettes

### Wellness Variant (Recommended for HormoIQ)
- Teal: `rgba(114, 185, 187, ...)` 🌊
- Light Teal: `rgba(181, 217, 217, ...)` 💧
- Peach: `rgba(255, 209, 189, ...)` 🍑
- Mint: `rgba(140, 197, 184, ...)` 🌿

### Calm Variant
- Sky Blue: `rgba(147, 197, 253, ...)` ☁️
- Lavender: `rgba(196, 181, 253, ...)` 💜
- Off-white: `rgba(249, 250, 251, ...)` 🤍

### Energetic Variant
- Amber: `rgba(251, 191, 36, ...)` ⚡
- Gold: `rgba(252, 211, 77, ...)` ✨
- Cream: `rgba(254, 243, 199, ...)` 🌟

### Night Variant
- Indigo: `rgba(79, 70, 229, ...)` 🌙
- Purple: `rgba(139, 92, 246, ...)` 🔮
- Light Indigo: `rgba(99, 102, 241, ...)` 🌌

---

## 🚀 Recommended Screen Assignments

Based on your app's Oura-inspired design:

| Screen | Component | Variant | Intensity | Why |
|--------|-----------|---------|-----------|-----|
| **Dashboard** | `GradientBackground` | Time-aware | `subtle` | Clean, professional |
| **Onboarding** | `AnimatedBackground` | `wellness` | `medium` | Welcoming |
| **ASK AI** | `GradientBackground` | `calm` | `subtle` | Focus, clarity |
| **Test Input** | `GradientBackground` | `default` | `subtle` | No distraction |
| **Profile** | `GradientBackground` | `default` | `subtle` | Clean, simple |
| **Insights** | `GradientBackground` | `wellness` | `subtle` | Health context |
| **Protocols** | `GradientBackground` | `energetic` | `subtle` | Motivating |
| **Track History** | `GradientBackground` | `default` | `subtle` | Data focus |

---

## ⚡ Performance Tips

1. **Use `GradientBackground` by default** - Much better performance
2. **Reserve `AnimatedBackground` for special screens** - Onboarding, splash
3. **Use `subtle` intensity** - Keeps focus on content
4. **Avoid on scroll-heavy screens** - Use static backgrounds

---

## 🎯 Migration Path

### Current State (No Background)
```tsx
<View style={styles.container}>
  <ScrollView>
    {/* Content */}
  </ScrollView>
</View>
```

### Step 1: Add Static Gradient (Recommended First)
```tsx
<GradientBackground variant="default" intensity="subtle">
  <ScrollView>
    {/* Content */}
  </ScrollView>
</GradientBackground>
```

### Step 2: Customize Per Screen
```tsx
<GradientBackground 
  variant="wellness"  // Choose based on screen purpose
  intensity="subtle"  // Keep subtle for readability
>
  <ScrollView>
    {/* Content */}
  </ScrollView>
</GradientBackground>
```

---

## 🔧 Technical Details

### AnimatedBackground
- **Animation Duration**: 12 seconds (4s per phase)
- **Layers**: 3 gradient layers with opacity animation
- **Memory**: ~3 Animated.Value instances
- **Re-renders**: Minimal (uses native driver)

### GradientBackground
- **Layers**: 1 static LinearGradient
- **Memory**: Minimal
- **Re-renders**: None (pure component)
- **Performance**: Excellent

---

## ✅ Next Steps

1. **Test on Dashboard**: Add `GradientBackground` to `app/(tabs)/index.tsx`
2. **Add Time Awareness**: Use time-based variants
3. **Apply to All Screens**: Gradually roll out to other screens
4. **Fine-tune Intensity**: Adjust based on user testing

---

## 🎨 Example: Full Dashboard Integration

```tsx
// app/(tabs)/index.tsx
import React from 'react';
import { ScrollView } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import AnimatedGreeting from '@/components/AnimatedGreeting';

export default function DashboardScreen() {
  const getTimeVariant = (): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <GradientBackground 
      variant={getTimeVariant()} 
      intensity="subtle"
    >
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <AnimatedGreeting userName="333" />
        {/* Rest of dashboard content */}
      </ScrollView>
    </GradientBackground>
  );
}
```

---

**Status**: ✅ Ready to use!  
**Dependencies**: `expo-linear-gradient` (already installed)  
**Compatibility**: iOS, Android, Web (Expo)

Enjoy your beautiful gradient backgrounds! 🎨✨

