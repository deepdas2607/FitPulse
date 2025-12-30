import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
// Replace these in your .env file with actual Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:demo',
};

// Initialize Firebase with error handling
let app: any = null;
let auth: any = null;
let db: any = null;

try {
  // Always try to initialize Firebase, even with demo values
  // This ensures auth object exists for hooks to work
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Check if using demo values and warn
  if (firebaseConfig.apiKey === 'demo-api-key' || firebaseConfig.projectId === 'demo-project') {
    console.warn('Firebase using demo configuration. Please set up Firebase environment variables for full functionality.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.warn('Firebase not properly configured. Some features may not work.');
  // Create minimal fallback objects to prevent crashes
  // Note: These won't work for actual Firebase operations
  auth = { currentUser: null } as any;
  db = null;
}

// Always export auth and db (auth will always exist, db may be null)
export { auth, db };
export default app;
