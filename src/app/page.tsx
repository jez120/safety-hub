'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {useState} from 'react';

export default function Home() {
  const {toast} = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setIsAdmin(true);
      toast({
        title: 'Admin Login',
        description: 'You have logged in as an administrator.',
      });
    } else {
      setIsAdmin(false);
      toast({
        title: 'User Login',
        description: 'You have logged in as a regular user.',
      });
    }
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
          Get started by logging in as a user or an administrator.
        </p>

        <div className="mt-6 flex justify-center items-center gap-4">
          <Button onClick={() => handleLogin('user')}>Login as User</Button>
          <Button onClick={() => handleLogin('admin')}>Login as Admin</Button>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Suggestion Submission</CardTitle>
              <CardDescription>Submit new safety suggestions.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Users can submit safety suggestions with descriptions,
                department, and submission date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggestion Tracking</CardTitle>
              <CardDescription>Track the status of your suggestions.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Users can view the status of their submitted suggestions to stay
                informed.
              </p>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Suggestion Management</CardTitle>
                <CardDescription>Manage and view all submitted suggestions.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Health and safety managers can view and manage all suggestions,
                  including updating their status.
                </p>
              </CardContent>
            </Card>
          )}

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Statistics</CardTitle>
                <CardDescription>View statistics on safety suggestions.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  The dashboard provides insights such as open suggestions and
                  average resolution times.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
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
