import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim()
};

// Initialize Firebase only if the API key exists (prevents crashes during CI/CD without .env.local)
const app = !getApps().length && firebaseConfig.apiKey ? initializeApp(firebaseConfig) : (getApps().length ? getApp() : null);
const auth = app ? getAuth(app) : (null as unknown as ReturnType<typeof getAuth>);
const googleProvider = app ? new GoogleAuthProvider() : (null as unknown as GoogleAuthProvider);

export { app, auth, googleProvider };
