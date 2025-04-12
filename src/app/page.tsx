'use client'

import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../lib/firebase'; // <-- ADJUST PATH if needed
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Optional: for signup link
import {Button} from '@/components/ui/button';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // To store and display error messages
  const [loading, setLoading] = useState(false); // To show loading state on button
  const router = useRouter();
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
      router.push('/'); // <-- ADJUST Redirect PATH if needed

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
          break;
        case 'auth/too-many-requests':
          friendlyMessage = 'Access temporarily disabled due to too many failed login attempts. You can reset your password or try again later.';
          break;
        case 'auth/user-disabled':
          friendlyMessage = 'This user account has been disabled.';
          break;
        // Add other specific Firebase Auth error codes if needed
      }
      setErrorMessage(friendlyMessage); // Update the state to display the message

    } finally {
      setLoading(false); // Ensure loading state is turned off
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Safety Hub Login</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="login-email" style={styles.label}>Email:</label>
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter your email"
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="login-password" style={styles.label}>Password:</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter your password"
          />
        </div>

        {/* Display Error Message */}
        {errorMessage && (
          <p style={styles.errorMessage}>
            {errorMessage}
          </p>
        )}

        <Button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Logging In...' : 'Login'}
        </Button>
              <Link href="/signup" className="text-blue-600 hover:underline">
        Create an account
      </Link>
      </form>
      {/* Optional: Link to Signup Page */}
      {/* <p style={styles.signupLink}>
        Don't have an account? <Link href="/signup">Sign Up</Link>
      </p> */}
    </div>
  );
}

// Basic Styling (you can replace this with your own CSS or styling library)
const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '30px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '25px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#555',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box', // Include padding in width
  },
  errorMessage: {
    color: 'red',
    backgroundColor: '#ffebee',
    border: '1px solid red',
    padding: '10px',
    borderRadius: '4px',
    textAlign: 'center',
    marginBottom: '15px',
    fontSize: '0.9em',
  },
  button: {
    padding: '12px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.2s ease',
  },
  // button:disabled: { // Add styling for disabled button if needed via CSS classes
  //   backgroundColor: '#ccc',
  //   cursor: 'not-allowed',
  // },
  signupLink: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '0.9em',
  }
};

export default LoginPage;
