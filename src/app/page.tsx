'use client';

import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/components/AuthProvider';
import {SignIn} from '@/components/SignIn';
import {SignUp} from '@/components/SignUp';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  const {toast} = useToast();
  const router = useRouter();
  const {user, signOutUser, loading} = useAuth();

  const handleAdminLogin = () => {
    router.push('/admin'); // Redirect to admin page
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast({
        title: 'Logout',
        description: 'You have been logged out.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: 'Failed to log out. Please try again.',
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
          {user
            ? `You are logged in as ${user.displayName || 'User'}.`
            : 'Get started by signing in or creating an account.'}
        </p>

        {!user ? (
          <div className="mt-6 flex justify-center items-start gap-4">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Sign in to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignIn />
              </CardContent>
            </Card>

            <Card className="w-96">
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create an account to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <SignUp />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-4">
            <Button onClick={handleLogout}>Logout</Button>
            <Button onClick={handleAdminLogin}>Admin Dashboard</Button>
          </div>
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
