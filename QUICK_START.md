# Quick Start Guide - HormoiQ

Get your app running in 5 minutes! ⚡

## ✅ Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18+ installed ([Download here](https://nodejs.org/))
- [ ] A Supabase account ([Sign up free](https://supabase.com))
- [ ] Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 min)

```bash
cd /Users/alexismireles/Documents/hormoiq/hormoiq
npm install
```

### Step 2: Create Supabase Project (2 min)

1. Go to [supabase.com](https://supabase.com) → Click "New Project"
2. Fill in project details and click "Create new project"
3. Wait ~2 minutes for provisioning

### Step 3: Get Your Credentials (1 min)

In your Supabase dashboard:
1. Click **Settings** (⚙️ icon) → **API**
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (long string)

### Step 4: Configure .env File (30 sec)

Open `.env` and paste your credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Run the App! (30 sec)

```bash
npm start
```

Then:
- Open **Expo Go** on your phone
- Scan the QR code from your terminal
- Your app should load! 🎉

## 🎯 Quick Test

1. App opens → You see the **Sign In** screen ✓
2. Tap "Sign Up" → Create an account
3. Check your email for verification (optional in dev)
4. Sign in → You see the **Home** screen with tabs ✓

## 📱 What You Built

Your app now has:

✅ **Authentication System**
- Sign up with email/password
- Sign in
- Sign out
- Session management

✅ **Navigation**
- Tab navigation (Home, Explore, Profile)
- Protected routes (must be logged in)
- Auth screens (Sign In, Sign Up)

✅ **Backend Ready**
- Supabase client configured
- Auth context provider
- Real-time capabilities ready

## 🎨 Project Structure

```
hormoiq/
├── app/
│   ├── (auth)/          ← Sign in/up screens
│   ├── (tabs)/          ← Main app (Home, Explore, Profile)
│   └── _layout.tsx      ← Auth protection & routing
├── lib/
│   └── supabase.ts      ← Supabase configuration
├── contexts/
│   └── AuthContext.tsx  ← Auth state management
└── .env                 ← Your credentials (keep secret!)
```

## 🔥 Next Steps

### Beginner Next Steps:
1. **Customize the home screen** (`app/(tabs)/index.tsx`)
2. **Add your app name** and colors (`app.json`, `constants/Colors.ts`)
3. **Test sign up/sign in** with different emails

### Intermediate Next Steps:
1. **Create a database table** in Supabase
2. **Add profile editing** to the Profile screen
3. **Build a feature** specific to your app

### Advanced Next Steps:
1. **Implement real-time features**
2. **Add file upload** for avatars
3. **Set up Row Level Security** policies
4. **Deploy to app stores**

## 📚 Documentation

- **Full Setup Guide**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Supabase Examples**: See [docs/SUPABASE_EXAMPLES.md](./docs/SUPABASE_EXAMPLES.md)
- **Project README**: See [README.md](./README.md)

## 🐛 Common Issues

### "Invalid API key" Error
- Check your `.env` file has correct credentials
- Restart the dev server: `npm start`

### "User already registered"
- Use a different email or sign in instead

### App won't start
```bash
# Clear cache and restart
npx expo start -c
```

### Environment variables not loading
- Ensure `.env` is in the root folder
- Variables must start with `EXPO_PUBLIC_`
- Restart the development server

## 💡 Pro Tips

1. **Enable hot reload**: Edit any file and see changes instantly
2. **Test on real device**: More accurate than simulator
3. **Check Supabase logs**: Dashboard → Logs → All logs
4. **Use TypeScript**: Already configured for you!

## 🆘 Need Help?

- **Issues?** Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed troubleshooting
- **Supabase questions?** [Supabase Discord](https://discord.supabase.com/)
- **Expo questions?** [Expo Forums](https://forums.expo.dev/)

## 🎉 You're Ready!

You now have a production-ready foundation with:
- ✅ Authentication
- ✅ Navigation
- ✅ Backend (Supabase)
- ✅ TypeScript
- ✅ Modern UI

Start building your features and make this app your own! 🚀

---

**Time to first screen**: ~5 minutes
**Time to production-ready**: You're already there! 🎊

