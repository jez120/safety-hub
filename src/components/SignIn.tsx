'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useAuth} from '@/components/AuthProvider';
import {useToast} from '@/hooks/use-toast';
import Link from 'next/link';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {signIn, loading} = useAuth();
    const [errorMessage, setErrorMessage] = useState('');
  const {toast} = useToast();

  const handleSubmit = async e => {
    e.preventDefault();
        setErrorMessage('');
    try {
      await signIn(email, password);
      toast({
        title: 'Sign in successful',
        description: 'You have successfully signed in.',
      });
    } catch (error: any) {
      console.error('Sign-in failed:', error);
            let friendlyMessage = 'An unexpected error occurred. Please try again.'; // Default message
            if (error.message === 'Firebase: Error (auth/invalid-credential).') {
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: 'Invalid username or password. Please check your credentials.',
        });
      } else if (error.message === 'Firebase: Error (auth/user-not-found).') {
          toast({
              variant: 'destructive',
              title: 'Sign in failed',
              description: 'There is no user record corresponding to this identifier. The user may have been deleted.',
          });
      }
      else {
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
             {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <Button type="submit">Sign In</Button>
       <Link href="/signup" className="text-blue-600 hover:underline">
        Create an account
      </Link>
    </form>
  );
};

