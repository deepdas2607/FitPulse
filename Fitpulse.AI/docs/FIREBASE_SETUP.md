# Firebase Setup Instructions

## 🔥 Firebase Configuration Required

This application uses Firebase for authentication and data storage. You need to replace the placeholder API keys in the `.env` file with your actual Firebase project credentials.

## Step-by-Step Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get Started**
3. Enable the following sign-in methods:
   - **Email/Password**: Click on it and toggle "Enable"
   - **Google**: Click on it, toggle "Enable", and provide a support email

### 3. Create Firestore Database

1. In your Firebase project, go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location closest to your users
5. Click **Enable**

> **Note**: For production, you'll need to configure proper security rules.

### 4. Get Your Firebase Configuration

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. Click the **Web** icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "FitPulse Web")
6. Copy the `firebaseConfig` object

### 5. Update Your .env File

Open the `.env` file in the root of the `FitPulse-Ai-main` folder and replace the placeholder values:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
```

**Example** (with real values):
```env
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstu
VITE_FIREBASE_AUTH_DOMAIN=fitpulse-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fitpulse-app
VITE_FIREBASE_STORAGE_BUCKET=fitpulse-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### 6. Restart the Development Server

After updating the `.env` file:

1. Stop the current dev server (press `Ctrl+C` in the terminal)
2. Restart it with: `npm run dev`

## 🎉 You're Done!

Your FitPulse app is now connected to Firebase! You can:

- ✅ Sign up new users with email/password
- ✅ Sign in with Google OAuth
- ✅ Store user data in Firestore
- ✅ Authenticate users across sessions

## 📚 Firestore Collections

The app automatically creates these collections:

- **users**: User profiles (name, email, avatar)
- **healthMetrics**: Health tracking data per user
- **fitnessData**: Fitness tracking data per user

## 🔒 Security Notes

- **Never commit your `.env` file** to version control (it's already in `.gitignore`)
- For production, update Firestore security rules to restrict access
- Consider enabling App Check for additional security

## 🐛 Troubleshooting

**Issue**: "Firebase: Error (auth/configuration-not-found)"
- **Solution**: Make sure you've updated the `.env` file with real values and restarted the dev server

**Issue**: "Firebase: Error (auth/unauthorized-domain)"
- **Solution**: In Firebase Console → Authentication → Settings → Authorized domains, add `localhost`

**Issue**: Google Sign-in popup closes immediately
- **Solution**: Check that Google authentication is enabled in Firebase Console and you've provided a support email
