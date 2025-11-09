# Setup Checklist for HormoiQ

Use this checklist to get your app up and running!

## ✅ Setup Steps

### 1. Environment Setup
- [ ] Node.js 18+ installed
- [ ] npm or yarn available
- [ ] Expo Go app installed on phone
- [ ] Supabase account created

### 2. Install Dependencies
- [ ] Run `npm install`
- [ ] Wait for installation to complete
- [ ] No errors during installation

### 3. Create Supabase Project
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Create new project
- [ ] Wait for project to be provisioned (~2 min)
- [ ] Project is ready (green indicator)

### 4. Get Supabase Credentials
- [ ] Open Settings → API in Supabase dashboard
- [ ] Copy Project URL
- [ ] Copy anon/public key
- [ ] Keep tab open for reference

### 5. Configure Environment Variables
- [ ] Open `.env` file in project root
- [ ] Replace `your-supabase-url` with actual URL
- [ ] Replace `your-supabase-anon-key` with actual key
- [ ] Save the file

### 6. Configure Supabase Settings
- [ ] Go to Authentication → Providers
- [ ] Verify Email provider is enabled
- [ ] (Optional) Disable email confirmations for dev
- [ ] Save settings

### 7. Start Development Server
- [ ] Run `npm start`
- [ ] Wait for Metro bundler to start
- [ ] QR code appears in terminal
- [ ] No error messages

### 8. Test on Device
- [ ] Open Expo Go on phone
- [ ] Scan QR code from terminal
- [ ] App starts loading
- [ ] Sign In screen appears

### 9. Test Authentication
- [ ] Tap "Sign Up" link
- [ ] Enter test email and password
- [ ] Submit form
- [ ] Account created successfully
- [ ] (If email verification enabled) Check email
- [ ] Sign in with credentials
- [ ] Reach Home screen with tabs

### 10. Verify All Features
- [ ] Home tab shows welcome message
- [ ] Explore tab is accessible
- [ ] Profile tab shows user email
- [ ] Sign out works correctly
- [ ] Sign in again works

## 🎯 Optional Enhancements

### Customize Your App
- [ ] Update app name in `app.json`
- [ ] Customize colors in `constants/Colors.ts`
- [ ] Modify home screen in `app/(tabs)/index.tsx`
- [ ] Update app description

### Add Custom Features
- [ ] Create database tables in Supabase
- [ ] Define TypeScript types in `types/index.ts`
- [ ] Implement your first feature
- [ ] Test on both iOS and Android

### Production Preparation
- [ ] Set up Row Level Security (RLS) policies
- [ ] Configure email templates
- [ ] Add app icons and splash screens
- [ ] Test on real devices
- [ ] Set up error tracking
- [ ] Configure analytics

## 📝 Notes

### Credentials Template
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Common Commands
```bash
npm start              # Start dev server
npm run ios            # Run on iOS
npm run android        # Run on Android
npm run type-check     # Check types
npx expo start -c      # Clear cache and start
```

### Quick Test Account
For testing, you can use:
- Email: test@example.com (or any email)
- Password: test123 (min 6 characters)

## ❗ Troubleshooting

### Issue: "Invalid API key"
**Solution**: 
- Double-check `.env` file has correct credentials
- No extra spaces or quotes
- Restart dev server with `npm start`

### Issue: App won't start
**Solution**:
```bash
npx expo start -c  # Clear cache
```

### Issue: "User already registered"
**Solution**:
- Use different email
- Or sign in instead of signing up

### Issue: Changes not appearing
**Solution**:
- Shake device → Reload
- Or restart with `npm start`

## 🎉 Success Criteria

You're all set when:
- ✅ App loads without errors
- ✅ Can create new account
- ✅ Can sign in
- ✅ Can navigate between tabs
- ✅ Can sign out
- ✅ Profile shows user info

## 📚 Next Steps

Once everything is working:

1. **Read the docs**: 
   - `README.md` for overview
   - `SETUP_GUIDE.md` for details
   - `docs/SUPABASE_EXAMPLES.md` for code samples

2. **Start building**:
   - Customize the home screen
   - Add your first feature
   - Create database tables

3. **Join communities**:
   - [Expo Discord](https://discord.gg/expo)
   - [Supabase Discord](https://discord.supabase.com/)
   - [React Native Community](https://reactnative.dev/community/overview)

## ✨ Congratulations!

If you've checked all the boxes above, your app is ready for development! 🚀

Start building your features and make this app your own!

---

**Need help?** Check `SETUP_GUIDE.md` or `QUICK_START.md` for detailed instructions.

