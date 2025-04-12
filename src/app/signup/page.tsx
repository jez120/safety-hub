'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useAuth} from '@/components/AuthProvider';
import {useToast} from '@/hooks/use-toast';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
                    <Link href="/" className="text-blue-600 hover:underline">
                        Home
                    </Link>
                 </form>
              </CardContent>
            </Card>
          </main>
     </div>
  );
}
