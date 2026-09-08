import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC160Jf-awWqnR1oLcWWTnOWTsN8jteeSc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bloom-app-3ea31.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bloom-app-3ea31",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bloom-app-3ea31.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1053761782637",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1053761782637:web:ec0800bcc0d37d91e81064",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };

export const getMessagingInstance = async () => {
  try {
    if (await isSupported()) {
      return getMessaging(app);
    }
  } catch (e) {
    console.error("Messaging not supported", e);
  }
  return null;
};
