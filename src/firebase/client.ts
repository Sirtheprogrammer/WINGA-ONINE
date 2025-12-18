import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { firebaseLoggerUtil } from '../services/logger';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
try {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  firebaseLoggerUtil.info('INIT', 'Firebase app initialized successfully', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });
} catch (error) {
  firebaseLoggerUtil.error('INIT', 'Failed to initialize Firebase app', error as Error, {
    projectId: firebaseConfig.projectId
  });
  throw error;
}

let db;
let auth;

try {
  db = getFirestore(app);
  firebaseLoggerUtil.info('INIT', 'Firestore database initialized successfully');
} catch (error) {
  firebaseLoggerUtil.error('INIT', 'Failed to initialize Firestore', error as Error);
  throw error;
}

try {
  auth = getAuth(app);
  firebaseLoggerUtil.info('INIT', 'Firebase Auth initialized successfully');
} catch (error) {
  firebaseLoggerUtil.error('INIT', 'Failed to initialize Firebase Auth', error as Error);
  throw error;
}

export { db, auth };

// Enable persistence for faster auth state restoration
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      firebaseLoggerUtil.info('PERSISTENCE', 'Auth persistence enabled successfully');
    })
    .catch((error) => {
      firebaseLoggerUtil.error('PERSISTENCE', 'Failed to set auth persistence', error, {
        persistenceType: 'browserLocalPersistence'
      });
  });
}


