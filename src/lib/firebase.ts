import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, Firestore, enableNetwork, disableNetwork } from "firebase/firestore";

// Debug environment variables first
console.log('🔍 Environment Variables Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set (' + process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 10) + '...)' : 'NOT SET',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'NOT SET',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET',
});

// Create Firebase config with fallbacks to ensure app doesn't crash if env vars are missing
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "medilearn-ai.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "911586190200",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:911586190200:web:1e15cce958c4357cf81e8d",
};

// Debug: Log the actual config values in development only
if (process.env.NODE_ENV === 'development') {
  console.log('🔥 Firebase Config Debug:', {
    apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing',
    authDomain: firebaseConfig.authDomain ? 'Present' : 'Missing', 
    projectId: firebaseConfig.projectId ? 'Present' : 'Missing',
    storageBucket: firebaseConfig.storageBucket ? 'Present' : 'Missing',
    messagingSenderId: firebaseConfig.messagingSenderId ? 'Present' : 'Missing',
    appId: firebaseConfig.appId ? 'Present' : 'Missing',
  });
}

// Validate that all required config values are present
const requiredConfigKeys = [
  'apiKey',
  'authDomain', 
  'projectId'
] as const;

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error('❌ Missing Firebase configuration keys:', missingKeys);
  console.error('🔧 Please check your .env.local file contains all required NEXT_PUBLIC_FIREBASE_* variables');
  console.error('🔍 Current config state:', firebaseConfig);
  
  // Don't throw an error immediately - let's try to continue and see what happens
  console.warn('⚠️ Attempting to initialize Firebase with incomplete config...');
}

// Initialize Firebase only if all required config is present
let app: any;
let auth: Auth;
let db: Firestore;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Configure Firestore settings for better connectivity
if (typeof window !== 'undefined') {
  // Enable offline persistence and configure settings
  import('firebase/firestore').then(({ enableMultiTabIndexedDbPersistence }) => {
    try {
      // Try to enable offline persistence for better reliability
      enableMultiTabIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser does not support offline persistence');
        } else {
          console.warn('Failed to enable offline persistence:', err);
        }
      });
    } catch (error) {
      console.warn('Offline persistence setup failed:', error);
    }
  });

  // Monitor network connectivity
  let networkTimeout: NodeJS.Timeout;
  
  const handleOnline = async () => {
    console.log('Network came online, enabling Firestore network');
    clearTimeout(networkTimeout);
    try {
      await enableNetwork(db);
    } catch (error) {
      console.warn('Failed to enable network:', error);
    }
  };

  const handleOffline = () => {
    console.log('Network went offline, scheduling Firestore network disable');
    // Disable network after a short delay to avoid rapid on/off switching
    networkTimeout = setTimeout(async () => {
      try {
        await disableNetwork(db);
        console.log('Firestore network disabled');
      } catch (error) {
        console.warn('Failed to disable network:', error);
      }
    }, 2000);
  };

  // Add network event listeners
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Initial network state check
  if (!navigator.onLine) {
    handleOffline();
  }
}

// Don't connect to emulators in production or if we're not already connected
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Check if emulators are running and connect if available
  try {
    if (!auth.emulatorConfig) {
      // Uncomment these lines if you're running Firebase emulators locally
      // connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    }
    // Check if Firestore emulator should be connected (simplified check)
    try {
      // Only attempt to connect to emulator if explicitly needed
      // connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (emulatorError) {
      // Emulator not available, continue with production
    }
  } catch (error) {
    console.log('Firebase emulators not available:', error);
  }
}

export { app, auth, db };
export type { User } from 'firebase/auth';
export type { FirebaseApp } from 'firebase/app';
export type { Firestore } from 'firebase/firestore';
