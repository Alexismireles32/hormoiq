# File Guide - What Each File Does

This guide explains the purpose of every file in your HormoiQ project.

## 📱 App Directory (`app/`)

Main application screens and navigation logic.

### Authentication (`app/(auth)/`)

| File | Purpose |
|------|---------|
| `_layout.tsx` | Layout wrapper for auth screens (sign-in, sign-up) |
| `sign-in.tsx` | Sign in screen with email/password form |
| `sign-up.tsx` | Sign up screen with email/password/confirm password |

**When to edit**: Customize auth UI, add social login, modify validation

### Main App (`app/(tabs)/`)

| File | Purpose |
|------|---------|
| `_layout.tsx` | Tab navigation configuration (bottom tabs) |
| `index.tsx` | Home screen (first tab) - main landing page |
| `two.tsx` | Explore screen (second tab) - ready for features |
| `profile.tsx` | Profile screen (third tab) - user info & sign out |

**When to edit**: Add features, customize screens, change tab structure

### Root Level (`app/`)

| File | Purpose |
|------|---------|
| `_layout.tsx` | **Root layout** - Handles auth protection, routing, font loading |
| `+html.tsx` | HTML template for web builds |
| `+not-found.tsx` | 404 error screen for invalid routes |
| `modal.tsx` | Example modal screen |

**When to edit**: Change app-wide behavior, add providers, modify navigation

## 🧩 Components (`components/`)

Reusable UI components.

| File | Purpose |
|------|---------|
| `Themed.tsx` | Dark mode-aware Text and View components |
| `EditScreenInfo.tsx` | Example info component (can be deleted) |
| `ExternalLink.tsx` | Component for opening external links |
| `StyledText.tsx` | Pre-styled text component |
| `useColorScheme.ts` | Hook to detect dark/light mode |
| `useColorScheme.web.ts` | Web-specific color scheme hook |
| `useClientOnlyValue.ts` | Hook for client-only values (SSR) |
| `useClientOnlyValue.web.ts` | Web-specific client value hook |

**When to edit**: Create new reusable components, modify theming

## 🎨 Constants (`constants/`)

App-wide constants and configuration.

| File | Purpose |
|------|---------|
| `Colors.ts` | Color palette for light and dark modes |

**When to edit**: Change app colors, add theme colors

## 🔐 Contexts (`contexts/`)

React Context providers for global state.

| File | Purpose |
|------|---------|
| `AuthContext.tsx` | **Critical** - Manages authentication state globally |

**When to edit**: Modify auth behavior, add auth methods

**Key exports**:
- `AuthProvider`: Wrap app with this
- `useAuth()`: Hook to access auth state
- Provides: `session`, `user`, `loading`, `signOut()`

## 🛠️ Lib (`lib/`)

Core utilities and third-party configurations.

| File | Purpose |
|------|---------|
| `supabase.ts` | **Critical** - Supabase client configuration |
| `utils.ts` | Helper functions (validation, formatting, errors) |

**When to edit**: 
- `supabase.ts`: Never (unless changing config)
- `utils.ts`: Add utility functions as needed

**Key utilities in `utils.ts`**:
- `isValidEmail()`: Email validation
- `isValidPassword()`: Password validation
- `formatDate()`: Date formatting
- `getErrorMessage()`: User-friendly error messages
- `debounce()`: Rate limiting function calls
- And more...

## 📝 Types (`types/`)

TypeScript type definitions.

| File | Purpose |
|------|---------|
| `index.ts` | App-wide TypeScript types and interfaces |

**When to edit**: Add types for your data models, API responses

**Key types**:
- `AuthContextType`: Auth context shape
- `SignInFormData`: Sign in form structure
- `SignUpFormData`: Sign up form structure

## 📚 Docs (`docs/`)

Additional documentation.

| File | Purpose |
|------|---------|
| `SUPABASE_EXAMPLES.md` | Code examples for Supabase operations |

**When to edit**: Add your own code examples and patterns

## 🎨 Assets (`assets/`)

Images, fonts, and other static files.

### Images (`assets/images/`)
- `icon.png`: App icon
- `splash-icon.png`: Splash screen image
- `adaptive-icon.png`: Android adaptive icon
- `favicon.png`: Web favicon

### Fonts (`assets/fonts/`)
- `SpaceMono-Regular.ttf`: Example custom font

**When to edit**: Replace with your own icons, images, fonts

## 🔧 Configuration Files

### `.env`
**Purpose**: Environment variables (Supabase credentials)
**⚠️ IMPORTANT**: Never commit to git! Already in `.gitignore`

```env
EXPO_PUBLIC_SUPABASE_URL=your-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### `.env.example`
**Purpose**: Template for `.env` file (safe to commit)

### `app.json`
**Purpose**: Expo app configuration
- App name, slug, version
- Icon and splash screen paths
- iOS/Android specific settings
- Plugins and experiments

**When to edit**: Change app name, version, icons, bundle IDs

**Key fields**:
```json
{
  "name": "HormoiQ",
  "slug": "hormoiq",
  "version": "1.0.0",
  "ios": { "bundleIdentifier": "com.hormoiq.app" },
  "android": { "package": "com.hormoiq.app" }
}
```

### `package.json`
**Purpose**: NPM dependencies and scripts

**Scripts**:
- `npm start`: Start development server
- `npm run ios`: Run on iOS
- `npm run android`: Run on Android
- `npm run web`: Run on web
- `npm run type-check`: TypeScript validation

**When to edit**: Add dependencies, modify scripts

### `tsconfig.json`
**Purpose**: TypeScript compiler configuration

**When to edit**: Rarely - only if changing TS behavior

### `.gitignore`
**Purpose**: Files to exclude from git

**Key exclusions**:
- `node_modules/`
- `.env`
- `.expo/`
- Build artifacts

**When to edit**: Add patterns for files you want to ignore

## 📖 Documentation Files

| File | Purpose | Read When |
|------|---------|-----------|
| `README.md` | Main project documentation | First time setup |
| `QUICK_START.md` | 5-minute setup guide | Starting development |
| `SETUP_GUIDE.md` | Detailed setup instructions | Need help with setup |
| `PROJECT_SUMMARY.md` | Project overview | Understanding the project |
| `CHECKLIST.md` | Step-by-step setup checklist | Following setup process |
| `FILE_GUIDE.md` | This file - explains all files | Understanding structure |

## 🎯 Most Important Files

### For Setup:
1. `.env` - Add your Supabase credentials here
2. `app.json` - Configure your app name and settings

### For Development:
1. `app/(tabs)/index.tsx` - Start building your home screen here
2. `lib/supabase.ts` - Supabase client (already configured)
3. `contexts/AuthContext.tsx` - Auth state management
4. `types/index.ts` - Add your type definitions

### For Navigation:
1. `app/_layout.tsx` - Root navigation and auth protection
2. `app/(tabs)/_layout.tsx` - Tab navigation setup

### For Styling:
1. `constants/Colors.ts` - App color scheme
2. `components/Themed.tsx` - Dark mode components

## 📝 Common Editing Patterns

### Adding a New Screen

1. Create file in `app/(tabs)/` or `app/`
2. Add to navigation in `_layout.tsx`
3. Import types from `types/index.ts`
4. Use `useAuth()` for user data

**Example**:
```typescript
// app/(tabs)/new-screen.tsx
import { useAuth } from '@/contexts/AuthContext';

export default function NewScreen() {
  const { user } = useAuth();
  // ... your component
}
```

### Adding a Database Operation

1. Open `lib/supabase.ts` (client already configured)
2. Import supabase in your component
3. Use Supabase methods
4. Refer to `docs/SUPABASE_EXAMPLES.md`

**Example**:
```typescript
import { supabase } from '@/lib/supabase';

const fetchData = async () => {
  const { data, error } = await supabase
    .from('your_table')
    .select('*');
};
```

### Adding a New Type

1. Open `types/index.ts`
2. Add interface or type
3. Export it
4. Import in your components

**Example**:
```typescript
// types/index.ts
export interface UserProfile {
  id: string;
  name: string;
  email: string;
}
```

### Changing App Name

1. Open `app.json`
2. Change `"name"` field
3. Change `"slug"` field
4. Restart dev server

### Changing Colors

1. Open `constants/Colors.ts`
2. Modify light and dark themes
3. Changes apply app-wide

## 🚫 Files You Should NOT Edit

### Without Good Reason:
- `lib/supabase.ts` - Client config (already set up)
- `tsconfig.json` - TypeScript config
- `.expo/` directory - Build artifacts
- `node_modules/` - Dependencies

### Generated Files:
- `package-lock.json` - Auto-generated
- `expo-env.d.ts` - Auto-generated

## 🎓 Learning Path by File

### Beginner - Start Here:
1. `app/(tabs)/index.tsx` - Customize home screen
2. `constants/Colors.ts` - Change colors
3. `app.json` - Update app info

### Intermediate:
1. `app/(tabs)/profile.tsx` - Add profile features
2. `lib/utils.ts` - Add helper functions
3. `types/index.ts` - Define data models

### Advanced:
1. `contexts/AuthContext.tsx` - Modify auth behavior
2. `app/_layout.tsx` - Change navigation logic
3. `lib/supabase.ts` - Advanced Supabase config

## 🔍 Finding Things

### Where is...?

| Looking for | Location |
|-------------|----------|
| User's email | `useAuth().user?.email` |
| Navigation | `app/*/_layout.tsx` files |
| Colors | `constants/Colors.ts` |
| Auth logic | `contexts/AuthContext.tsx` |
| Supabase client | `lib/supabase.ts` |
| Utility functions | `lib/utils.ts` |
| Type definitions | `types/index.ts` |
| App config | `app.json` |
| Dependencies | `package.json` |

## 💡 Pro Tips

1. **Search by content**: Use `grep` or your editor's search
2. **Follow imports**: Trace where components come from
3. **Use TypeScript**: Hover over code to see types
4. **Read examples**: Check `docs/SUPABASE_EXAMPLES.md`
5. **Start small**: Edit one file at a time

## 🎯 Quick Reference

**Want to...**
- Change app name? → `app.json`
- Change colors? → `constants/Colors.ts`
- Add feature to home? → `app/(tabs)/index.tsx`
- Add database query? → Use `supabase` from `lib/supabase.ts`
- Add new type? → `types/index.ts`
- Add utility function? → `lib/utils.ts`
- Modify auth? → `contexts/AuthContext.tsx`
- Add new screen? → Create in `app/` and add to `_layout.tsx`

---

**Remember**: When in doubt, check the existing code for patterns and examples!

