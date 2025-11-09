# Anonymous Access Implementation ✅

**Status**: Complete  
**Date**: November 9, 2025

## 🎯 Overview

The app now supports **anonymous access** - users can scan the QR code and immediately start using the app without sign-up or login. Data is saved securely to their Supabase anonymous session and can be linked to a permanent account later via Shopify email + order number.

## ✅ What's Implemented

### 1. Auto Anonymous Sign-In (`contexts/AuthContext.tsx`)

**How It Works**:
- When app launches, checks for existing session
- If no session exists, automatically signs in anonymously
- Uses Supabase's built-in anonymous authentication
- Data is saved to database, tied to anonymous user ID

**Key Features**:
- ✅ Automatic sign-in on first launch
- ✅ `isAnonymous` flag available throughout app
- ✅ No email/password required
- ✅ Data persists in Supabase database
- ✅ Session maintained across app restarts

**Implementation**:
```typescript
// Auto sign-in anonymously if no session
if (!session) {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (!error && data.session) {
    setSession(data.session);
    setUser(data.session.user);
    setIsAnonymous(true);
  }
}
```

### 2. Updated Routing (`app/_layout.tsx`)

**Changes**:
- Removed forced redirect to auth screens
- Users go directly to main app
- Auth screens still available for future use
- No onboarding required (can be skipped)

**Behavior**:
- ✅ QR code scan → Main app immediately
- ✅ No splash screens or login
- ✅ Instant access to all features
- ✅ Data saved to Supabase

### 3. Optional Onboarding (`app/(onboarding)/index.tsx`)

**Skip Button for Anonymous Users**:
- Blue "Skip" button in top right
- Only visible to anonymous users
- Sets minimal defaults:
  - Birth year: 1990
  - Gender: male
  - Goals: energy
- Marks onboarding as complete
- Navigates to main app

**User Can Still Complete Onboarding**:
- If they want personalized experience
- Better BioAge calculations
- More accurate recommendations

### 4. Profile Screen (`app/(tabs)/profile.tsx`)

**Anonymous User Experience**:
- Shows "Guest User" instead of email
- 👤 emoji instead of email initial
- "Anonymous • Your data is saved on this device" label
- Prominent "Create Account" prompt

**Account Creation Prompt**:
- 🔐 Lock icon
- "Save Your Data Forever" title
- Explanation about syncing
- Blue "Create Account" button
- Shows "Coming Soon" message (ready for Shopify integration)

**Account Linking (Coming Soon)**:
```typescript
// Future: Shopify email + order number
Alert.alert(
  'Coming Soon',
  'Account creation via Shopify email + order number will be available soon!'
);
```

### 5. Sign Out Behavior

**Modified Sign Out**:
- When user signs out, automatically signs back in anonymously
- No "logged out" state
- Always has access to app
- Fresh anonymous session

**Implementation**:
```typescript
const signOut = async () => {
  await supabase.auth.signOut();
  // Immediately sign back in anonymously
  const { data } = await supabase.auth.signInAnonymously();
  if (data.session) {
    setSession(data.session);
    setUser(data.session.user);
    setIsAnonymous(true);
  }
};
```

## 🔒 Data & Security

### Data Storage

**Anonymous Users**:
- Data saved in Supabase database
- Tied to anonymous user ID
- Same schema as registered users
- RLS policies still apply

**Supabase Anonymous Auth**:
- Built-in Supabase feature
- Secure session management
- Anonymous user ID is UUID
- Can be converted to permanent account

### Account Linking (Future)

**Shopify Integration (Pending)**:
1. User enters Shopify email
2. User enters order number
3. Backend verifies with Shopify API
4. Converts anonymous user to permanent user
5. Data is preserved
6. Email attached to account

**Supabase Support**:
- Anonymous users can be "upgraded"
- Preserves all existing data
- Changes `is_anonymous` flag
- Adds email to user record

## 📱 User Flow

### First Time User

```
1. Scan QR code
   ↓
2. App launches, auto signs in anonymously
   ↓
3. Sees onboarding (can skip)
   ↓
4. Lands on main app
   ↓
5. Can immediately log hormones, see READY score, etc.
```

### Returning Anonymous User

```
1. Opens app
   ↓
2. Session restored automatically
   ↓
3. All data intact
   ↓
4. Continues using app
```

### Converting to Permanent Account

```
1. Taps "Create Account" in profile
   ↓
2. [Future] Enters Shopify email + order
   ↓
3. Backend verifies
   ↓
4. Account upgraded
   ↓
5. All data preserved
   ↓
6. Can now log in from other devices
```

## 🎨 UI Changes

### Profile Screen

**Before** (Required Auth):
- Email displayed
- No account creation option
- Assumed user had account

**After** (Anonymous Support):
- "Guest User" for anonymous
- Clear anonymous label
- Prominent "Create Account" card
- Coming Soon message for Shopify

### Onboarding

**Before**:
- Required completion
- No way to skip

**After**:
- "Skip" button for anonymous users
- Sets defaults if skipped
- Still optional to complete

## 🔧 Technical Details

### AuthContext API

```typescript
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAnonymous: boolean; // NEW
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<{ error: any }>; // NEW
}
```

### Using isAnonymous

```typescript
const { user, isAnonymous } = useAuth();

// Show different UI
{isAnonymous && (
  <View>
    <Text>You're using the app anonymously!</Text>
  </View>
)}

// Hide features for anonymous users
{!isAnonymous && (
  <Button>Admin Panel</Button>
)}
```

### Supabase Configuration

**Requires**:
- Anonymous sign-ins enabled in Supabase
- Go to: Authentication → Providers → Email → Enable Anonymous sign-ins

**Database**:
- Same `users` table
- Anonymous users have `is_anonymous = true` in auth.users
- All data stored normally
- Can be queried/filtered

## 🧪 Testing

### Test Scenarios

1. **Fresh Install**:
   - Clear app data
   - Scan QR code
   - Should land in main app immediately
   - Can log hormones

2. **Skip Onboarding**:
   - Fresh install
   - Tap "Skip" in onboarding
   - Should land in main app
   - Profile shows defaults

3. **Complete Onboarding**:
   - Fresh install
   - Complete all 3 steps
   - Should land in main app
   - Profile shows entered data

4. **Sign Out**:
   - Tap "Sign Out" in profile
   - Should stay in app
   - New anonymous session
   - Fresh data

5. **Account Creation Button**:
   - Tap "Create Account"
   - Should see "Coming Soon" message
   - Ready for Shopify integration

## 🚀 Future: Shopify Integration

### Architecture

**Backend Needed**:
- Supabase Edge Function
- Receives: email, order_number
- Calls Shopify API to verify
- Returns: success/failure

**Flow**:
1. User taps "Create Account"
2. Modal opens with 2 inputs:
   - Shopify email
   - Order number
3. App calls Edge Function
4. Edge Function verifies with Shopify
5. If valid:
   - Converts anonymous user to permanent
   - Attaches email
   - Preserves all data
6. If invalid:
   - Shows error message
   - User can retry

### Supabase Edge Function (Pseudocode)

```typescript
// supabase/functions/link-shopify-account/index.ts

export async function handler(req: Request) {
  const { email, orderNumber } = await req.json();
  
  // 1. Verify with Shopify API
  const isValid = await verifyShopifyOrder(email, orderNumber);
  
  if (!isValid) {
    return { error: 'Invalid order' };
  }
  
  // 2. Get current anonymous user
  const user = await supabase.auth.getUser();
  
  // 3. Update user with email (converts to permanent)
  await supabase.auth.updateUser({
    email: email,
  });
  
  // 4. Update users table
  await supabase
    .from('users')
    .update({ email: email })
    .eq('id', user.id);
  
  return { success: true };
}
```

### App Changes Needed

**Create Modal** (`app/auth/link-account.tsx`):
```typescript
<Modal>
  <TextInput placeholder="Shopify Email" />
  <TextInput placeholder="Order Number" />
  <Button onPress={linkAccount}>Link Account</Button>
</Modal>
```

**Link Function**:
```typescript
const linkAccount = async (email, orderNumber) => {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    body: JSON.stringify({ email, orderNumber })
  });
  
  if (response.ok) {
    Alert.alert('Success!', 'Account linked!');
    // Refresh auth state
  }
};
```

## 📊 Benefits

### User Experience
- ✅ Zero friction to start
- ✅ No sign-up forms
- ✅ Instant access
- ✅ Can upgrade later
- ✅ Data preserved

### Business
- ✅ Higher conversion
- ✅ Lower bounce rate
- ✅ Better trial experience
- ✅ Tied to Shopify orders
- ✅ Easy to track

### Technical
- ✅ Uses Supabase built-in feature
- ✅ Secure
- ✅ Scalable
- ✅ Easy to maintain
- ✅ Data integrity preserved

## ⚠️ Important Notes

### Anonymous Sessions

**Persistence**:
- Sessions persist across app restarts
- Stored in device's secure storage
- Same as regular auth sessions

**Limitations**:
- Cannot access from multiple devices
- If user clears app data, new session created
- Encourage linking account for safety

### Data Loss Prevention

**User Should Link Account If**:
- They want to access from multiple devices
- They want permanent backup
- They're a paying customer

**Encourage Linking**:
- Show prompt in profile
- Periodic reminders
- After significant data entry

### RLS Policies

**Still Enforced**:
- Anonymous users can only see their own data
- Same security as registered users
- User ID used for filtering

## 🎯 Success Criteria - All Met!

- [x] Auto anonymous sign-in on launch
- [x] No forced auth screens
- [x] Instant app access
- [x] Data saved to Supabase
- [x] Can skip onboarding
- [x] Profile shows anonymous status
- [x] Account creation prompt
- [x] Ready for Shopify integration
- [x] Sign out keeps user in app
- [x] All features accessible

**Anonymous Access - COMPLETE ✅**

Users can now scan QR and immediately use the app. Account creation via Shopify email + order number is ready to implement when needed!

---

## 📝 Summary

**What Changed**:
1. `AuthContext` - Auto anonymous sign-in
2. `_layout.tsx` - Skip auth routing
3. `profile.tsx` - Anonymous UI + account creation
4. `onboarding/index.tsx` - Skip button

**What's Ready**:
- Instant app access
- Data saved securely
- Shopify integration structure

**What's Next**:
- Implement Shopify verification
- Create link account modal
- Add periodic reminders to link account

