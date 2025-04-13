
'use client';

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  getAuth,
} from 'firebase/auth';
import {initializeApp, getApp, FirebaseApp} from 'firebase/app';
import {getFirestore, doc, getDoc, setDoc} from 'firebase/firestore';
import {useToast} from '@/hooks/use-toast';

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

let firebaseApp: FirebaseApp;

function createFirebaseApp() {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!apiKey) {
        console.error(
            'Firebase API key is missing. Make sure to set NEXT_PUBLIC_FIREBASE_API_KEY in your environment variables.'
        );
        return null;
    }

    const firebaseConfig = {
        apiKey: apiKey,
        authDomain: "safety-hub-lqzg4.firebaseapp.com",
        projectId: "safety-hub-lqzg4",
        storageBucket: "safety-hub-lqzg4.firebasestorage.app",
        messagingSenderId: "379696949296",
        appId: "1:379696949296:web:b96447ae38849fb80d65f5"
    };
  try {
    firebaseApp = getApp();
  } catch (e) {
    firebaseApp = initializeApp(firebaseConfig);
  }
  return firebaseApp;
}

// AuthProvider component to manage authentication state
export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
    const {toast} = useToast();
  const app = createFirebaseApp();

  useEffect(() => {
    if (!app) {
          setLoading(false);
          return;
    }

      const auth = getAuth(app);
      const unsubscribe = onAuthStateChanged(auth, async user => {
          if (user) {
              try {
                  const db = getFirestore(app); // Assuming you have this initialized
                  const userDoc = doc(db, "users", user.uid);
                  const docSnap = await getDoc(userDoc);

                  if (docSnap.exists()) {
                      const userData = docSnap.data();
                      const role = userData.role || 'user'; // Default to 'user' if no role
                      setUser({
                          ...user,
                          role: role,
                      } as User & { role: string }); // Extend the User type
                  } else {
                      // If no doc exists, assume a default role or handle as needed
                      setUser({
                          ...user,
                          role: 'user',
                      } as User & { role: string });
                  }
              } catch (error) {
                  console.error("Failed to fetch user role:", error);
                  setUser(user as User & { role: string }); // Still set user, but without role
              } finally {
                  setLoading(false);
              }
          } else {
              setUser(null);
              setLoading(false);
          }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [app]);

  // Sign-up function
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
        const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Update the user's profile with the display name
      await updateProfile(userCredential.user, {displayName});
      // After updating the profile, update the local state
       const db = getFirestore(app);
            await setDoc(doc(db, "users", userCredential.user.uid), {
                name: displayName,
                email: email,
                role: 'user', // default role
            });
      setUser(userCredential.user as User & { role: string });
    }    catch (error: any) {
            console.error('Signup failed:', error);
             if (error.code === 'auth/email-already-in-use') {
                  toast({
                      variant: 'destructive',
                      title: 'Sign up failed',
                      description: 'That email is already in use. Please use a different email or sign in.',
                  });
              }
            throw error; // Re-throw to handle it in the component
        }
  };

  // Sign-in function
  const signIn = async (email: string, password: string) => {
    try {
        const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
    }    catch (error: any) {
            console.error('Signin failed:', error);
             if (error.message === 'Firebase: Error (auth/invalid-credential).') {
                  throw new Error('Invalid email or password. Please check your credentials.');
              }
            throw error; // Re-throw to handle it in the component
        }
  };

  // Sign-out function
  const signOutUser = async () => {
    try {
        const auth = getAuth(app);
      await signOut(auth);
    } catch (error: any) {
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
