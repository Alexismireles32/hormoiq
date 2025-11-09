# 🎨 Eli Health Design Replication Plan

## Overview
Complete redesign of HormoIQ app to match Eli Health's aesthetic across all screens and components.

---

## ✅ COMPLETED (Phase 1)

### 1. **Design System Updated** (`constants/DesignSystem.ts`)
- ✅ Soft pastel color palette (blue, purple, green, yellow, pink)
- ✅ Soft gradient backgrounds (yellowBlur, purpleBlur, blueBlur, greenBlur, pinkBlur, multiBlur)
- ✅ Ultra-light typography weights (100, 200 for large numbers/headings)
- ✅ Serif font family for marketing copy
- ✅ Circular progress component styles
- ✅ Pill badge styles for health journal tags
- ✅ Minimal shadow styles

### 2. **Core Components Created**
- ✅ `EliBackground.tsx` - Soft gradient backgrounds with blur circles
- ✅ `EliCircularProgress.tsx` - Thin-stroke circular progress (like Eli's)
- ✅ `home-eli.tsx` - Demo dashboard matching Eli's layout

---

## 🚧 IN PROGRESS (Phase 2)

### 3. **Dashboard Redesign** 
**File: `app/(tabs)/index.tsx`**

**Changes Needed:**
```typescript
// Replace current layout with:
<EliBackground type="multi">
  {/* Header with profile photo (top right) */}
  <Header>
    <Greeting>Good Morning, Alex</Greeting>
    <ProfilePhoto />
  </Header>

  {/* Hormone cards with circular progress */}
  <HormoneCard backgroundColor="#DBEAFE"> {/* Soft blue */}
    <Title>Cortisol</Title>
    <EliCircularProgress value={90} label="Optimal" />
  </HormoneCard>

  <HormoneCard backgroundColor="#DCFCE7"> {/* Soft green */}
    <Title>Progesterone</Title>
    <EliCircularProgress value={85} label="Optimal" />
  </HormoneCard>

  {/* Bottom nav with large center button */}
  <BottomNav>
    <NavButton icon="🏠" label="Home" />
    <CenterButton icon="+" /> {/* Large, elevated */}
    <NavButton icon="📋" label="Plans" />
  </BottomNav>
</EliBackground>
```

**Key UI Elements:**
- Serif italic greeting: "Good Morning,"
- Profile photo in top right (44x44 circle)
- Hormone cards with pastel backgrounds
- Large circular progress (160-180px diameter, 2px stroke)
- Ultra-light numbers (100 weight, 80px font size)
- Bottom nav with 64x64 center button (elevated, black)

---

## 📋 TODO (Phase 3-10)

### 4. **Test Input Screen** (`app/test/input.tsx`)
**Eli Style:**
- Photo tutorial carousel (like Eli's saliva collection)
- Progress dots at top
- Large photo with overlay text
- Black "Next" button at bottom
- Skip button (text only)
- Timer circle for wait period

**Example Screens:**
1. "Collect saliva in your mouth" (photo)
2. "Soak the test pad" (photo)
3. "Place test for 20 minutes" (timer)

### 5. **Track Screen** (`app/(tabs)/track.tsx`)
**Eli Style:**
- D/W/M/Y tabs at top
- Date picker (blue background for selected)
- Area chart with soft fill
- Individual measurement cards
- Timeline view with photos
- "Within range" labels

### 6. **Navigation Update** (All tab screens)
**Changes:**
- Remove current tab bar
- Add bottom nav to all screens:
  - Home (🏠)
  - Center button (+) - 64x64, black, elevated
  - Plans (📋)
- Center button always accessible for quick test logging

### 7. **Health Journal System** (New feature)
**File: `app/(tabs)/journal.tsx` (new)**

**UI Elements:**
- Header: "Health journal"
- Explanation text
- "Create a tag" button (dashed border)
- Expandable sections:
  - Mood (with pills: Low energy, Stressed, Excited)
  - Symptoms (with pills: Joint pain, Fatigue, Inflammation)
- Active pills = black background, white text
- Inactive pills = white background, gray border

### 8. **Insights Screen** (Keep but simplify)
**Current: Complex grid with animations**
**Eli Style: Simpler cards**
- Brooklyn's Cortisol Insights (card)
- Metrics (card)
- Simple list layout
- Minimal animations
- Focus on data clarity

### 9. **Profile Photo Integration**
**Add to all screens:**
- Top right corner (44x44 circle)
- Tap to go to profile
- Show first initial if no photo
- Black circle with white letter as fallback

### 10. **Onboarding Redesign** (`app/(onboarding)`)
**Eli Style:**
- Photo-based tutorials
- Carousel with swipe
- Minimal text overlays
- "Skip all videos" button
- Progress indicators
- Soft gradient backgrounds

---

## 🎨 Design Tokens Reference

### Colors
```typescript
// Hormone card backgrounds
cortisol: '#DBEAFE'        // Soft blue
progesterone: '#DCFCE7'    // Soft green
testosterone: '#FED7AA'    // Soft orange

// UI elements
black: '#000000'           // Primary text, buttons
white: '#FFFFFF'           // Cards, backgrounds
lightGray: '#F3F4F6'       // Borders, disabled

// Gradient backgrounds
yellowBlur: ['#FFFBEB', '#FEF3C7', '#FDE68A']
purpleBlur: ['#FAF5FF', '#F3E8FF', '#E9D5FF']
blueBlur: ['#EFF6FF', '#DBEAFE', '#BFDBFE']
greenBlur: ['#F0FDF4', '#DCFCE7', '#BBF7D0']
```

### Typography
```typescript
// Headings (serif italic)
greeting: {
  fontFamily: 'Georgia',
  fontStyle: 'italic',
  fontSize: 28,
  fontWeight: '300',
}

// Large numbers (ultra-light)
circularProgressValue: {
  fontSize: 80,
  fontWeight: '100',
  letterSpacing: -3,
}

// Labels
label: {
  fontSize: 15,
  fontWeight: '400',
}

// Sublabels
sublabel: {
  fontSize: 13,
  fontWeight: '300',
  color: '#6B7280',
}
```

### Components
```typescript
// Circular progress
{
  size: 180,
  strokeWidth: 2,
  backgroundColor: '#F3F4F6',
  foregroundColor: '#000000',
}

// Hormone card
{
  borderRadius: 16,
  padding: 24,
  backgroundColor: '#DBEAFE', // or other pastel
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
}

// Bottom nav center button
{
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: '#000000',
  marginTop: -32, // Half height to overlap
  shadowOpacity: 0.15,
  shadowRadius: 12,
}

// Pill badge
{
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 20,
  borderWidth: 1,
  // Active:
  backgroundColor: '#000000',
  borderColor: '#000000',
  // Inactive:
  backgroundColor: '#FFFFFF',
  borderColor: '#E5E7EB',
}
```

---

## 📸 Eli App Screenshot Analysis

### Screen 1: Saliva Collection Tutorial
- Full-screen photo
- White overlay card at bottom
- Progress dots (5 dots)
- Large serif italic text
- Black button "Next"
- X button top right

### Screen 2: Health Journal
- White background
- Header with back button
- Explanation text (gray)
- Dashed border "Create a tag" button
- Expandable sections with chevrons
- Pill badges (white/black states)
- Tag badges (yellow highlight for categories)

### Screen 3: Cortisol Trend (Day view)
- Profile photo top right
- D/W/M/Y pills at top
- Date selector (blue background)
- Area chart with blue fill
- Axis labels (6AM, 12PM, 6PM, 12AM)
- Wake up time indicator
- Latest reading card at bottom
- Bottom nav with large center button

### Screen 4: Progesterone Trend (Month view)
- Same layout as Screen 3
- Green area chart
- Calendar axis (1, 7, 14, 21, 28)
- M/Y toggle at top

### Screen 5: Eli Branding
- Large logo
- Serif italic tagline
- Product photo (hormometer device)
- Awards badges

### Screen 6: Dashboard
- "Good Morning, Alex"
- Profile photo top right
- Cortisol card (blue, score 90)
- Progesterone card (green, score 85)
- Circular progress indicators
- Bottom nav

### Screen 7: Onboarding Carousel
- 3 screens side by side
- "To ensure accurate results..." (with icons)
- Product photo with "Feel free to"
- "After use" instructions
- "Skip all videos" / "Next" buttons

### Screen 8: Measurements List
- Back button
- Filter icon (top right)
- Today section
- Measurement cards with time
- Range sliders
- "Within range" labels
- Photos attached to some measurements

### Screen 9: Test Timer
- Large circular timer (20:00)
- Progress ring around timer
- Instruction card at bottom
- "Log now" / "Skip" buttons

---

## 🚀 Implementation Priority

### Week 1: Core Experience
1. ✅ Design system (colors, typography)
2. ✅ Background component
3. ✅ Circular progress component
4. 🔄 Dashboard redesign
5. ⏳ Bottom navigation
6. ⏳ Profile photo integration

### Week 2: Key Screens
7. ⏳ Test input with photos
8. ⏳ Track screen with area charts
9. ⏳ Health journal system

### Week 3: Polish
10. ⏳ Onboarding redesign
11. ⏳ Insights simplification
12. ⏳ All animations and micro-interactions

---

## 📝 Notes

- **Keep existing functionality** (all features work)
- **Only change UI/UX** to match Eli
- **Maintain data structure** (no database changes)
- **Progressive rollout** (can coexist with current design)
- **Test on device** after each major change

---

## 🎯 Success Criteria

- [ ] Soft gradient backgrounds on all screens
- [ ] Circular progress indicators (thin stroke, large numbers)
- [ ] Bottom nav with large center button
- [ ] Profile photos in top right
- [ ] Serif italic headings for marketing copy
- [ ] Pastel hormone card backgrounds
- [ ] Photo-based tutorials for test input
- [ ] Area charts for hormone trends
- [ ] Health journal with pill badges
- [ ] Minimal shadows and borders
- [ ] Ultra-light typography for numbers
- [ ] Black/white primary color scheme

---

**Current Status: 30% Complete**
- Design system: ✅ Done
- Core components: ✅ Done
- Dashboard: 🔄 In Progress
- Remaining screens: ⏳ Pending

