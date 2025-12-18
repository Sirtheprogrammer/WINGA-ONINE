import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/client';
import { User } from '../types';
import { authLogger } from '../services/logger';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mapFirebaseUser = async (firebaseUser: FirebaseUser | null): Promise<User | null> => {
  if (!firebaseUser) {
    authLogger.debug('MAP_USER', 'No Firebase user provided, returning null');
    return null;
  }

  authLogger.debug('MAP_USER', 'Mapping Firebase user to application user', {
    uid: firebaseUser.uid,
    email: firebaseUser.email
  });

  // Try to get user data from Firestore with timeout for faster loading
  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 2000)
    );
    
    const userDoc = await Promise.race([
      getDoc(doc(db, 'users', firebaseUser.uid)),
      timeoutPromise
    ]);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      authLogger.info('MAP_USER', 'User data fetched from Firestore successfully', {
        uid: firebaseUser.uid,
        hasRole: !!data.role,
        hasName: !!data.name
      });
      
      return {
        id: firebaseUser.uid,
        name: data.name || firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        avatar: data.avatar || firebaseUser.photoURL || undefined,
        role: data.role || 'user' // Default to 'user' if role not set
      };
    } else {
      authLogger.warn('MAP_USER', 'User document does not exist in Firestore, using Auth data', {
        uid: firebaseUser.uid
      });
    }
  } catch (error) {
    // If Firestore is slow or fails, fallback to Auth data (faster)
    // This ensures auth state loads quickly even if Firestore is slow
    if (error instanceof Error && error.message !== 'Timeout') {
      authLogger.error('MAP_USER', 'Error fetching user data from Firestore', error, {
        uid: firebaseUser.uid,
        errorType: error.constructor.name
      });
    } else if (error instanceof Error && error.message === 'Timeout') {
      authLogger.warn('MAP_USER', 'Firestore fetch timeout, falling back to Auth data', {
        uid: firebaseUser.uid
      });
    }
  }

  // Fallback to Firebase Auth data (faster, no network call)
  authLogger.debug('MAP_USER', 'Using Firebase Auth data as fallback', {
    uid: firebaseUser.uid
  });
  
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'User',
    email: firebaseUser.email || '',
    avatar: firebaseUser.photoURL || undefined,
    role: 'user' // Default role
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    authLogger.info('AUTH_STATE', 'Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) {
        authLogger.debug('AUTH_STATE', 'Component unmounted, skipping auth state update');
        return;
      }
      
      try {
        if (firebaseUser) {
          authLogger.info('AUTH_STATE', 'Auth state changed: user signed in', {
            uid: firebaseUser.uid,
            email: firebaseUser.email
          });
        } else {
          authLogger.info('AUTH_STATE', 'Auth state changed: user signed out');
        }
        
        const mappedUser = await mapFirebaseUser(firebaseUser);
        if (isMounted) {
          setUser(mappedUser);
          setLoading(false);
          
          if (mappedUser) {
            authLogger.info('AUTH_STATE', 'User state updated successfully', {
              uid: mappedUser.id,
              role: mappedUser.role
            });
          } else {
            authLogger.info('AUTH_STATE', 'User state cleared (no user)');
          }
        }
      } catch (error) {
        authLogger.error('AUTH_STATE', 'Error mapping user during auth state change', error as Error, {
          hasFirebaseUser: !!firebaseUser,
          uid: firebaseUser?.uid
        });
        
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    }, (error) => {
      authLogger.error('AUTH_STATE', 'Auth state listener error', error, {
        errorCode: (error as any).code
      });
    });

    return () => {
      authLogger.debug('AUTH_STATE', 'Cleaning up auth state listener');
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    authLogger.info('LOGIN', 'Login attempt initiated', { email });
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      authLogger.info('LOGIN', 'Login successful', {
        uid: userCredential.user.uid,
        email: userCredential.user.email
      });
      
      const mappedUser = await mapFirebaseUser(userCredential.user);
      setUser(mappedUser);
      
      authLogger.info('LOGIN', 'User state updated after login', {
        uid: mappedUser?.id,
        role: mappedUser?.role
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      const errorCode = error.code || 'UNKNOWN';
      
      authLogger.error('LOGIN', 'Login failed', error, {
        email,
        errorCode,
        errorMessage
      });
      
      setLoading(false);
      throw new Error(errorMessage);
    } finally {
    setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    authLogger.info('SIGNUP', 'Signup attempt initiated', { email, name });
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      authLogger.info('SIGNUP', 'User account created in Firebase Auth', {
        uid: userCredential.user.uid,
        email: userCredential.user.email
      });
      
      // Update display name
      try {
      await updateProfile(userCredential.user, { displayName: name });
        authLogger.info('SIGNUP', 'User profile updated with display name', {
          uid: userCredential.user.uid
        });
      } catch (profileError) {
        authLogger.error('SIGNUP', 'Failed to update user profile', profileError as Error, {
          uid: userCredential.user.uid
        });
        // Continue even if profile update fails
      }
      
      // Create user document in Firestore
      try {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
      name,
      email,
        createdAt: new Date().toISOString(),
        avatar: null,
        role: 'user' // Default role for new users
      });
        authLogger.info('SIGNUP', 'User document created in Firestore', {
          uid: userCredential.user.uid
        });
      } catch (firestoreError) {
        authLogger.error('SIGNUP', 'Failed to create user document in Firestore', firestoreError as Error, {
          uid: userCredential.user.uid
        });
        // Continue even if Firestore document creation fails
      }

      const mappedUser = await mapFirebaseUser(userCredential.user);
      setUser(mappedUser);
      
      authLogger.info('SIGNUP', 'Signup completed successfully', {
        uid: mappedUser?.id,
        role: mappedUser?.role
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Signup failed';
      const errorCode = error.code || 'UNKNOWN';
      
      authLogger.error('SIGNUP', 'Signup failed', error, {
        email,
        name,
        errorCode,
        errorMessage
      });
      
      setLoading(false);
      throw new Error(errorMessage);
    } finally {
    setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    const userId = user?.id;
    
    authLogger.info('LOGOUT', 'Logout attempt initiated', {
      uid: userId,
      email: user?.email
    });
    
    try {
      await signOut(auth);
    setUser(null);
      
      authLogger.info('LOGOUT', 'Logout successful', {
        uid: userId
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Logout failed';
      const errorCode = error.code || 'UNKNOWN';
      
      authLogger.error('LOGOUT', 'Logout failed', error, {
        uid: userId,
        errorCode,
        errorMessage
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    authLogger.info('GOOGLE_AUTH', 'Google sign-in attempt initiated');
    
    try {
      const provider = new GoogleAuthProvider();
      // Request additional scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      const userCredential = await signInWithPopup(auth, provider);
      authLogger.info('GOOGLE_AUTH', 'Google sign-in successful', {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName
      });
      
      // Check if user document exists in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create user document for new Google sign-in users
        authLogger.info('GOOGLE_AUTH', 'Creating new user document in Firestore', {
          uid: userCredential.user.uid
        });
        
        try {
          await setDoc(userDocRef, {
            name: userCredential.user.displayName || 'User',
            email: userCredential.user.email || '',
            createdAt: new Date().toISOString(),
            avatar: userCredential.user.photoURL || null,
            role: 'user', // Default role for new users
            provider: 'google' // Track authentication provider
          });
          authLogger.info('GOOGLE_AUTH', 'User document created in Firestore', {
            uid: userCredential.user.uid
          });
        } catch (firestoreError) {
          authLogger.error('GOOGLE_AUTH', 'Failed to create user document in Firestore', firestoreError as Error, {
            uid: userCredential.user.uid
          });
          // Continue even if Firestore document creation fails
        }
      } else {
        // Update existing user document with latest info from Google
        const existingData = userDoc.data();
        if (!existingData.avatar && userCredential.user.photoURL) {
          try {
            await setDoc(userDocRef, {
              ...existingData,
              avatar: userCredential.user.photoURL,
              displayName: userCredential.user.displayName || existingData.name
            }, { merge: true });
            authLogger.info('GOOGLE_AUTH', 'Updated existing user document with Google profile info', {
              uid: userCredential.user.uid
            });
          } catch (updateError) {
            authLogger.warn('GOOGLE_AUTH', 'Failed to update user document', updateError as Error, {
              uid: userCredential.user.uid
            });
          }
        }
      }
      
      const mappedUser = await mapFirebaseUser(userCredential.user);
      setUser(mappedUser);
      
      authLogger.info('GOOGLE_AUTH', 'Google sign-in completed successfully', {
        uid: mappedUser?.id,
        role: mappedUser?.role
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Google sign-in failed';
      const errorCode = error.code || 'UNKNOWN';
      
      authLogger.error('GOOGLE_AUTH', 'Google sign-in failed', error, {
        errorCode,
        errorMessage
      });
      
      setLoading(false);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, signup, signInWithGoogle, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};