'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/AuthProvider';
// import { useToast } from '@/hooks/use-toast'; // Remove toast import

export const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error message state
  const { signUp } = useAuth();
  // const { toast } = useToast(); // Remove toast usage

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null); // Clear previous errors
    try {
      await signUp(email, password, name);
      // Success: Optionally clear fields or redirect here.
      // No toast on success.
      setName('');
      setEmail('');
      setPassword('');
      // Consider adding a subtle success message inline if needed
      // setErrorMessage('Account created successfully!'); // Example
    } catch (error: any) {
      console.error("Signup component caught error:", error);
      // Set inline error message based on the error code
      if (error?.code === 'auth/email-already-in-use') {
        setErrorMessage('This email address is already registered. Please try logging in or use a different email.');
      } else if (error?.code === 'auth/weak-password'){
          setErrorMessage('Password is too weak. It should be at least 6 characters long.');
      } else if (error?.code === 'auth/invalid-email') {
            setErrorMessage('Please enter a valid email address.');
      } else {
        setErrorMessage('Sign up failed. Please try again later.'); // Generic fallback
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading}
          aria-invalid={errorMessage?.includes('email') ? true : undefined}
          aria-describedby={errorMessage?.includes('email') ? 'signup-error' : undefined}
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
          aria-invalid={errorMessage?.includes('password') ? true : undefined}
          aria-describedby={errorMessage?.includes('password') ? 'signup-error' : undefined}
        />
      </div>
      {/* Display Error Message Inline */}
      {errorMessage && (
          <p id="signup-error" className="text-sm font-medium text-destructive">
              {errorMessage}
          </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? 'Signing Up...' : 'Sign Up'}
      </Button>
    </form>
  );
};
