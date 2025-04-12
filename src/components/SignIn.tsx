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
  const {signIn} = useAuth();
  const {toast} = useToast();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await signIn(email, password);
      toast({
        title: 'Sign in successful',
        description: 'You have successfully signed in.',
      });
    } catch (error: any) {
      if (error.message === 'Invalid email or password. Please check your credentials.') {
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: 'Invalid email or password. Please check your credentials.',
        });
      } else {
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
      <Button type="submit">Sign In</Button>
       <Link href="/signup" className="text-blue-600 hover:underline">
                        Create an account
       </Link>
    </form>
  );
};
