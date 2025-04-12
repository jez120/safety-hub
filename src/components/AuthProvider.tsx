'use client';

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import {initializeApp} from 'firebase/app';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Create a context for authentication
const AuthContext = createContext<{
  user: User | null;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  loading: boolean;
}>({
  user: null,
  signUp: async () => {},
  signIn: async () => {},
  signOutUser: async () => {},
  loading: true,
});

// AuthProvider component to manage authentication state
export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Sign-up function
  const signUp = async (email: string, password: string, displayName: string) => {
    const auth = getAuth(app);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Update the user's profile with the display name
      await updateProfile(userCredential.user, {displayName});
      // After updating the profile, update the local state
      setUser(userCredential.user);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error; // Re-throw to handle it in the component
    }
  };

  // Sign-in function
  const signIn = async (email: string, password: string) => {
    const auth = getAuth(app);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Signin failed:', error);
      throw error; // Re-throw to handle it in the component
    }
  };

  // Sign-out function
  const signOutUser = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Signout failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{user, signUp, signIn, signOutUser, loading}}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the authentication context
export const useAuth = () => useContext(AuthContext);
