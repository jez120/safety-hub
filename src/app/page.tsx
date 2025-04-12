'use client'

import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Import getAuth
import { app } from '../lib/firebase'; // <-- ADJUST PATH if needed
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Optional: for signup link
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from "@/hooks/use-toast";
import { getFirestore, doc, getDoc } from "firebase/firestore";

async function getUserRole(userId: string): Promise<{ isAdmin: boolean }> {
  // Replace this with your actual implementation to fetch the user's role from your database
  return { isAdmin: false };
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // To store and display error messages
  const [loading, setLoading] = useState(false); // To show loading state on button
  const router = useRouter();
  const { toast } = useToast()

    // Initialize Firebase auth
    const auth = getAuth(app);

  // Function to handle form submission
  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent page reload
    setLoading(true);
    setErrorMessage(''); // Clear any previous error messages

    try {
      // Attempt Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login Successful', userCredential.user.uid);

      // --- SUCCESS ---
      // Redirect to the home page or dashboard after successful login
      // You might want to check the user's role here first before redirecting
      // For now, just redirecting to home page:
      const db = getFirestore(app);
        const userDocRef = doc(db, "users", userCredential.user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            const role = userData.role || 'user'; // Default to 'user' if no role

            if (role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/user');
            }
        } else {
            // Handle the case where the user document doesn't exist
            console.warn("User document not found in Firestore, assigning 'user' role.");
            router.push('/user'); // Or handle differently
        }


    } catch (error) {
      // --- FAILURE ---
      console.error('Login Error Code:', error.code, error.message); // Log the specific error code
      let friendlyMessage = 'An unexpected error occurred. Please try again.'; // Default

      // Set a user-friendly message based on the error code
      switch (error.code) {
        case 'auth/invalid-email':
          friendlyMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          friendlyMessage = 'Incorrect email or password entered.';
            toast({
                variant: 'destructive',
                title: 'Authentication failed',
                description: 'Invalid credentials'
            })
          break;
        case 'auth/too-many-requests':
          friendlyMessage = 'Access temporarily disabled due to too many failed login attempts. You can reset your password or try again later.';
           toast({
                variant: 'destructive',
                title: 'Authentication failed',
                description: 'Too many attempts'
            })
          break;
        case 'auth/user-disabled':
          friendlyMessage = 'This user account has been disabled.';
           toast({
                variant: 'destructive',
                title: 'Authentication failed',
                description: 'Account disabled'
            })
          break;
        // Add other specific Firebase Auth error codes if needed
      }
      setErrorMessage(friendlyMessage); // Update the state to display the message

    } finally {
      setLoading(false); // Ensure loading state is turned off
    }
  };

  return (
       <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
       <Card className="w-96">
              <CardHeader>
                <CardTitle>Safety Hub Login</CardTitle>
                <CardDescription>Enter your credentials to log in</CardDescription>
              </CardHeader>
              <CardContent>
                 <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                       <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                         <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                      {errorMessage && (
          <p style={{ color: 'red' }}>
            {errorMessage}
          </p>
        )}
                    <Button type="submit" disabled={loading}>
                         {loading ? 'Logging In...' : 'Login'}
                    </Button>
                     <Link href="/signup" className="text-blue-600 hover:underline">
                        Create an account
                    </Link>
                 </form>
              </CardContent>
            </Card>
          </main>
           <footer className="flex justify-center items-center w-full h-12 border-t">
          <a
            href="https://arekpeter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{' '}
            <span className="font-semibold">
              Arek Peter Inc.
            </span>
          </a>
        </footer>
     </div>
  );
}


export default LoginPage;
