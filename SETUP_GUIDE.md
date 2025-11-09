# HormoiQ Setup Guide

This guide will walk you through setting up your HormoiQ app with Supabase authentication.

## Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" (or "New Project" if you already have an account)
3. Sign up or log in
4. Click "New Project"
5. Fill in the project details:
   - **Name**: hormoiq (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is perfect to start
6. Click "Create new project"
7. Wait 2-3 minutes for your project to be provisioned

### 2. Get Your Supabase Credentials

1. Once your project is ready, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL**: Something like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: A long string starting with `eyJ...`
4. Keep this tab open - you'll need these values in the next step

### 3. Configure Your App

1. Open the `.env` file in the root of your project
2. Replace the placeholder values with your actual Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file

### 4. Verify Email Settings in Supabase

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Make sure **Email** is enabled (it should be by default)
3. Scroll down to **Email Auth** section
4. For development, you can enable "Disable email confirmations" to test faster
   - ⚠️ Remember to re-enable this for production!

### 5. Optional: Customize Email Templates

1. Go to **Authentication** > **Email Templates**
2. You can customize:
   - Confirm signup email
   - Magic Link email  
   - Change Email Address email
   - Reset Password email

### 6. Install Dependencies (if you haven't already)

```bash
npm install
```

### 7. Start the Development Server

```bash
npm start
```

This will open the Expo developer tools. You can:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with Expo Go app on your phone

### 8. Test Authentication

1. When the app loads, you should see the Sign In screen
2. Tap "Sign Up" to create a new account
3. Enter an email and password (min 6 characters)
4. If email confirmation is enabled, check your email and click the confirmation link
5. Sign in with your credentials
6. You should now see the main app with tabs!

## Troubleshooting

### "Invalid API key" or "401 Unauthorized"

- Double-check your `.env` file has the correct credentials
- Make sure there are no extra spaces or quotes around the values
- Restart the Expo development server (`npm start`)

### "User already registered"

- This means an account with that email already exists
- Try signing in instead of signing up
- Or use a different email address

### Email not arriving

- Check your spam folder
- Verify the email address is correct
- In Supabase dashboard, go to Authentication > Users to see if the user was created
- For development, you can disable email confirmation in Supabase settings

### App crashes on startup

```bash
# Clear cache and restart
npx expo start -c
```

### Environment variables not working

- Make sure your `.env` file is in the root directory (next to package.json)
- Variable names must start with `EXPO_PUBLIC_` to be accessible
- Restart the development server after changing `.env`

## Next Steps

Now that your app is set up, you can:

1. **Create Database Tables**: Go to your Supabase dashboard > Database > Tables
2. **Add Storage**: Set up file storage for user uploads
3. **Implement Features**: Add your app-specific functionality
4. **Set up Row Level Security**: Protect your data with RLS policies
5. **Deploy**: Build your app for production when ready

## Useful Supabase Features

### Database Tables

Create tables to store your app data:
1. Go to **Database** > **Tables**
2. Click "Create a new table"
3. Define your columns and constraints
4. Set up relationships between tables

### Row Level Security (RLS)

Protect your data:
1. Enable RLS on your tables
2. Create policies to control who can read/write data
3. Example policy: "Users can only see their own data"

```sql
-- Example: Users can only read their own records
CREATE POLICY "Users can view own records"
ON your_table_name
FOR SELECT
USING (auth.uid() = user_id);
```

### Storage

For file uploads (images, documents, etc.):
1. Go to **Storage**
2. Create a bucket (e.g., "avatars", "documents")
3. Set up access policies
4. Use Supabase client to upload files from your app

### Real-time Subscriptions

Listen to database changes in real-time:
1. Enable real-time on your tables
2. Subscribe to changes in your React Native code
3. Perfect for chat apps, collaborative features, etc.

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)

## Need Help?

- Check the [README.md](./README.md) for more information
- Visit [Expo Forums](https://forums.expo.dev/)
- Join [Supabase Discord](https://discord.supabase.com/)
- Search [Stack Overflow](https://stackoverflow.com/questions/tagged/expo) for similar issues

