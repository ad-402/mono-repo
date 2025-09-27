import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

/**
 * Initializes Firebase Web SDK using provided config.
 * Uses the user-provided client credentials.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyCm3ffEctAcR-Kz2mpEtMsE_rNSDRlwwQU',
  authDomain: 'internship-6214d.firebaseapp.com',
  projectId: 'internship-6214d',
  storageBucket: 'internship-6214d.firebasestorage.app',
  messagingSenderId: '7597607861',
  appId: '1:7597607861:web:e46f41168aa883d49867fc',
  measurementId: 'G-HLJ51Z9TCP',
} as const;

let firestoreInstance: ReturnType<typeof getFirestore> | null = null;

export function getDb() {
  if (!firestoreInstance) {
    if (getApps().length === 0) {
      initializeApp(firebaseConfig);
    }
    firestoreInstance = getFirestore();
  }
  return firestoreInstance;
}

export const COLLECTION_NAME = process.env.FIREBASE_COLLECTION || 'hashes';


