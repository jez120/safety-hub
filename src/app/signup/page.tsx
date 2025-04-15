'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useAuth} from '@/components/AuthProvider';
import {useToast} from '@/hooks/use-toast';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Import auth

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {signUp} = useAuth();
  const {toast} = useToast();
   const router = useRouter();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await signUp(email, password, name);
      toast({
        title: 'Sign up successful',
        description: 'Your account has been created.',
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign up failed',
        description: 'Failed to create account. Please try again.',
      });
    }
  };

  const handleSignOut = async () => {
    try {
        await signOut(auth);
        router.push('/');
    } catch (error) {
        console.error('Sign out failed', error);
        toast({
            variant: 'destructive',
            title: 'Sign out failed',
            description: 'Could not log out. Please try again.',
        });
    }
  };

  return (
     <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
       <Card className="w-96">
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create an account to get started</CardDescription>
              </CardHeader>
              <CardContent>
                 <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <Input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        />
                    </div>
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
                    <Button type="submit">Sign Up</Button>
                    <Button type="button" variant="link" onClick={handleSignOut} className="text-blue-600 hover:underline">
                        Log Off
                    </Button>
                 </form>
              </CardContent>
            </Card>
          </main>
     </div>
  );
}
