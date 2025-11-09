# 🌌 Apply Aurora Background to Every Page

## Quick Reference - 3 Steps Per Screen

### 1. Import
```typescript
import { AuroraBackground } from '@/components/AuroraBackground';
```

### 2. Wrap your return statement
```typescript
return (
  <AuroraBackground showRadialGradient={true}>
    {/* All your existing content */}
  </AuroraBackground>
);
```

### 3. Make container transparent
```typescript
// In your StyleSheet:
container: {
  flex: 1,
  // Remove or comment out: backgroundColor: 'white'
},
```

---

## 📋 Complete Screen List

### Tab Screens (Priority 1)
- [ ] `app/(tabs)/index.tsx` - Home/Dashboard
- [x] `app/(tabs)/ask.tsx` - **DONE**
- [ ] `app/(tabs)/insights.tsx` - Insights
- [ ] `app/(tabs)/track.tsx` - Track
- [ ] `app/(tabs)/profile.tsx` - Profile  
- [ ] `app/(tabs)/protocols.tsx` - Protocols

### Test Screens
- [ ] `app/test/index.tsx` - Test selection
- [ ] `app/test/input.tsx` - Test input

### Feature Detail Screens
- [ ] `app/bioage.tsx` - BioAge detail
- [ ] `app/ready.tsx` - ReadyScore detail
- [ ] `app/impact.tsx` - Impact detail

### Onboarding
- [ ] `app/(onboarding)/index.tsx` - Onboarding flow
- [ ] `app/(onboarding)/consent.tsx` - Consent screen

### Auth Screens
- [ ] `app/(auth)/sign-in.tsx` - Sign in
- [ ] `app/(auth)/sign-up.tsx` - Sign up

### Legal Screens
- [ ] `app/(legal)/privacy.tsx` - Privacy policy
- [ ] `app/(legal)/terms.tsx` - Terms of service

---

## 🎯 Example Implementations

### Example 1: Home/Dashboard (`app/(tabs)/index.tsx`)

**Before:**
```typescript
export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text>Dashboard content</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
```

**After:**
```typescript
import { AuroraBackground } from '@/components/AuroraBackground';

export default function HomeScreen() {
  return (
    <AuroraBackground showRadialGradient={true}>
      <ScrollView style={styles.container}>
        <Text>Dashboard content</Text>
      </ScrollView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: removed!
  },
});
```

---

### Example 2: Test Input (`app/test/input.tsx`)

**Before:**
```typescript
export default function TestInputScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Input form */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
  },
});
```

**After:**
```typescript
import { AuroraBackground } from '@/components/AuroraBackground';

export default function TestInputScreen() {
  return (
    <AuroraBackground showRadialGradient={true}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Input form */}
        </View>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: removed!
  },
});
```

---

### Example 3: Onboarding (`app/(onboarding)/index.tsx`)

**Before:**
```typescript
export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Onboarding steps */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
```

**After:**
```typescript
import { AuroraBackground } from '@/components/AuroraBackground';

export default function OnboardingScreen() {
  return (
    <AuroraBackground showRadialGradient={true}>
      <View style={styles.container}>
        <ScrollView>
          {/* Onboarding steps */}
        </ScrollView>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: removed!
  },
});
```

---

### Example 4: Profile (`app/(tabs)/profile.tsx`)

**Before:**
```typescript
export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Profile content */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.neutral[0],
  },
});
```

**After:**
```typescript
import { AuroraBackground } from '@/components/AuroraBackground';

export default function ProfileScreen() {
  return (
    <AuroraBackground showRadialGradient={true}>
      <ScrollView style={styles.container}>
        {/* Profile content */}
      </ScrollView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: removed!
  },
});
```

---

## 🎨 Making Content Readable

For cards/sections that need to stand out:

```typescript
// Semi-transparent white cards
card: {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',  // 95% opaque
  borderRadius: DesignSystem.radius.xl,
  padding: DesignSystem.spacing[4],
  
  // Optional: Add subtle shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
},

// For headers/navigation bars
header: {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',  // 90% opaque
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(0, 0, 0, 0.05)',
},

// For bottom bars/input areas
footer: {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderTopWidth: 1,
  borderTopColor: 'rgba(0, 0, 0, 0.05)',
},
```

---

## ⚡ Batch Update Script

If you want to update all screens at once, here's the pattern:

```typescript
// Find all these patterns:
backgroundColor: '#FFFFFF'
backgroundColor: 'white'  
backgroundColor: DesignSystem.colors.background
backgroundColor: DesignSystem.colors.neutral[0]

// And either:
// 1. Remove them
// 2. Or replace with: backgroundColor: 'transparent'
```

---

## 🔧 Special Cases

### Screens with KeyboardAvoidingView

```typescript
<AuroraBackground showRadialGradient={true}>
  <KeyboardAvoidingView
    style={styles.keyboardContainer}  // No backgroundColor here
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    {/* Content */}
  </KeyboardAvoidingView>
</AuroraBackground>
```

### Screens with Modals/Overlays

```typescript
<AuroraBackground showRadialGradient={true}>
  <View style={styles.content}>
    {/* Main content */}
  </View>
  
  {/* Modal can be outside or inside - both work */}
  <Modal visible={showModal}>
    <View style={styles.modalContent}>
      {/* Modal can have its own background */}
    </View>
  </Modal>
</AuroraBackground>
```

### Screens with Bottom Sheet/Tabs

```typescript
<AuroraBackground showRadialGradient={true}>
  <View style={{ flex: 1 }}>
    <ScrollView style={styles.content}>
      {/* Content */}
    </ScrollView>
    
    {/* Bottom tab bar with semi-transparent background */}
    <View style={styles.tabBar}>
      {/* Tabs */}
    </View>
  </View>
</AuroraBackground>
```

---

## 🎯 Props Reference

The AuroraBackground component has minimal props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Your screen content |
| `showRadialGradient` | `boolean` | `true` | Show the radial fade effect |
| `style` | `ViewStyle` | - | Additional container styles |

**Note:** Unlike the previous version, this component has a **fixed aesthetic** matching the 21st.dev original. No intensity/speed/color customization needed - it's designed to work universally.

---

## 📊 Visual Consistency

The aurora effect provides:
- ✅ Consistent brand aesthetic across all screens
- ✅ Professional, modern feel
- ✅ Subtle animation (60s cycle - not distracting)
- ✅ Blue/violet wellness palette
- ✅ Off-white base (easy on eyes)

---

## 🐛 Troubleshooting

### Issue: Aurora not visible
**Solution:** Check that you removed `backgroundColor` from container styles

### Issue: Content hard to read
**Solution:** Add semi-transparent backgrounds to cards:
```typescript
backgroundColor: 'rgba(255, 255, 255, 0.95)'
```

### Issue: Animation stuttering
**Solution:** Ensure `useNativeDriver: true` is set (it already is)

### Issue: White flash on screen change
**Solution:** This is normal during navigation - consider adding a loading state

---

## ✅ Verification Checklist

After applying to a screen, verify:
- [ ] Aurora shimmer is visible (subtle blue/violet waves)
- [ ] Animation is smooth (60fps)
- [ ] Text is readable
- [ ] Navigation works normally
- [ ] No performance issues

---

## 🚀 Implementation Order

Recommended order (by user impact):

**Phase 1 - Core Experience:**
1. ✅ ASK™ (Done)
2. Home/Dashboard
3. Test Input
4. Test Selection

**Phase 2 - Navigation:**
5. Insights
6. Track
7. Profile
8. Protocols

**Phase 3 - Onboarding:**
9. Onboarding flow
10. Consent screen

**Phase 4 - Auth & Legal:**
11. Sign In/Sign Up
12. Privacy/Terms

**Phase 5 - Details:**
13. BioAge/ReadyScore/Impact detail screens

---

## 📝 Notes

- The aurora effect is **subtle by design** - it's meant to add ambiance, not dominate
- The 60-second animation cycle is long enough to be non-distracting
- The blue/violet palette matches wellness/health aesthetics
- All screens will have a **consistent look and feel**

---

**Total Screens to Update:** ~16 screens  
**Time Per Screen:** ~2-3 minutes  
**Total Time:** ~45 minutes for entire app  

**Status:** Ready to deploy app-wide! 🎉

