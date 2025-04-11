'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';

export default function Home() {
  const {toast} = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const handleLogin = (role: 'user' | 'admin') => {
    setIsLoggedIn(true);
    if (role === 'admin') {
      setIsAdmin(true);
      toast({
        title: 'Admin Login',
        description: 'You have logged in as an administrator.',
      });
      router.push('/admin'); // Redirect to admin page
    } else {
      setIsAdmin(false);
      toast({
        title: 'User Login',
        description: 'You have logged in as a regular user.',
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    toast({
      title: 'Logout',
      description: 'You have been logged out.',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <a className="text-blue-600" href="https://example.com">
            Safety Hub!
          </a>
        </h1>

        <p className="mt-3 text-2xl">
          {isLoggedIn
            ? 'You are logged in.'
            : 'Get started by logging in as a user or an administrator.'}
        </p>

        {!isLoggedIn ? (
          <div className="mt-6 flex justify-center items-center gap-4">
            <Button onClick={() => handleLogin('user')}>Login as User</Button>
            <Button onClick={() => handleLogin('admin')}>Login as Admin</Button>
          </div>
        ) : (
          <Button onClick={handleLogout}>Logout</Button>
        )}
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">
        <p>
          Powered by{' '}
          <a className="text-blue-600" href="https://example.com">
            Example Inc.
          </a>
        </p>
      </footer>
    </div>
  );
}
