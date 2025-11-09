# HormoiQ

A React Native mobile app built with Expo and Supabase for authentication and backend services.

## Features

- ✅ **Anonymous Access** - No sign-up required! Users can scan QR and use the app immediately
- ✅ Expo Router for navigation
- ✅ Supabase authentication (anonymous + future Shopify integration)
- ✅ TypeScript support
- ✅ Protected routes
- ✅ Tab navigation
- ✅ Modern UI with dark mode support
- ✅ Hormone tracking (Cortisol, Testosterone, DHEA)
- ✅ READY Score - Daily readiness calculation
- ✅ BioAge - Biological age estimation
- ✅ Protocol Library - Evidence-based optimization protocols
- ✅ Admin Panel - System management dashboard

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo Go app on your mobile device (for testing)
- Supabase account (free tier available)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to Settings > API
3. Copy your project URL and anon/public key

### 3. Configure Environment Variables

Create a `.env` file in the root directory (or update the existing one):

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Replace the values with your actual Supabase credentials from step 2.

### 4. Enable Anonymous Authentication in Supabase

1. In your Supabase dashboard, go to Authentication > Providers
2. Click on "Email" provider
3. **Enable "Anonymous sign-ins"** (required for instant app access)
4. Save changes

This allows users to start using the app immediately without sign-up!

### 5. Run the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## Project Structure

```
hormoiq/
├── app/                      # App screens and navigation
│   ├── (auth)/              # Authentication screens
│   │   ├── sign-in.tsx      # Sign in screen
│   │   ├── sign-up.tsx      # Sign up screen
│   │   └── _layout.tsx      # Auth layout
│   ├── (tabs)/              # Main app tabs
│   │   ├── index.tsx        # Home screen
│   │   ├── two.tsx          # Explore screen
│   │   ├── profile.tsx      # Profile screen
│   │   └── _layout.tsx      # Tabs layout
│   ├── _layout.tsx          # Root layout with auth protection
│   └── modal.tsx            # Example modal
├── components/              # Reusable components
├── constants/               # App constants and colors
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication context
├── lib/                     # Utilities and configurations
│   └── supabase.ts         # Supabase client configuration
└── assets/                  # Images, fonts, and other assets
```

## Authentication Flow

The app implements a secure authentication flow:

1. **Initial Load**: App checks for existing session
2. **Not Authenticated**: User is redirected to sign-in screen
3. **Sign Up**: Users can create an account with email/password
4. **Sign In**: Existing users can sign in with their credentials
5. **Protected Routes**: Authenticated users can access the main app tabs
6. **Sign Out**: Users can sign out from the profile screen

## Key Technologies

- **Expo**: React Native framework for cross-platform development
- **Expo Router**: File-based routing system
- **Supabase**: Backend-as-a-Service for authentication and database
- **TypeScript**: Type-safe development
- **React Native**: Cross-platform mobile development

## Development

### Running Linter

```bash
npm run lint
```

### Building for Production

```bash
# Build for iOS
npm run ios --configuration Release

# Build for Android
npm run android --variant=release
```

## Supabase Setup Tips

### Email Templates

Customize your authentication emails in Supabase:
1. Go to Authentication > Email Templates
2. Customize "Confirm signup", "Magic Link", etc.

### Database Tables

Create additional tables for your app data:
1. Go to Database > Tables
2. Create new tables as needed
3. Set up Row Level Security (RLS) policies for data protection

### Storage

Set up file storage:
1. Go to Storage
2. Create buckets for user uploads
3. Configure access policies

## Anonymous Access

### How It Works

The app uses **Supabase Anonymous Authentication** to provide instant access:

1. User scans QR code
2. App automatically signs them in anonymously
3. User can immediately use all features
4. Data is saved to their anonymous account in Supabase
5. Later, they can link their account (via Shopify email + order number)

### User Experience

**Anonymous Users**:
- See "Guest User" in profile
- Can skip onboarding
- All features available
- Data persists across app restarts
- Prompted to create account to sync across devices

**Account Linking (Coming Soon)**:
- Users enter Shopify email + order number
- System verifies with Shopify API
- Anonymous account converts to permanent account
- All data is preserved

See `ANONYMOUS_ACCESS.md` for full technical details.

## Troubleshooting

### Environment Variables Not Loading

Make sure your `.env` file is in the root directory and restart the development server.

### Authentication Not Working

1. Check that your Supabase credentials are correct in `.env`
2. Verify email authentication is enabled in Supabase dashboard
3. Check Supabase logs in the dashboard for error details

### App Not Starting

```bash
# Clear cache and restart
npx expo start -c
```

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev/)

## License

MIT

