'use client';

import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/components/AuthProvider';
import {SignIn} from '@/components/SignIn';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {format} from 'date-fns';
import {collection, query, where, getDocs, getFirestore} from 'firebase/firestore';
import {app} from '@/lib/firebase';

export default function Home() {
  const {toast} = useToast();
  const router = useRouter();
  const {user, signOutUser, loading} = useAuth();
  const [suggestions, setSuggestions] = useState([]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast({
        title: 'Logout',
        description: 'You have been logged out.',
      });
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: 'Failed to log out. Please try again.',
      });
    }
  };

  const handleAddSuggestion = () => {
    router.push('/new-suggestion');
  };

  useEffect(() => {
    async function loadSuggestions() {
      if (user) {
        const db = getFirestore(app);
        const suggestionsCollection = collection(db, 'suggestions');
        const q = query(suggestionsCollection, where('userId', '==', user.uid));

        try {
          const querySnapshot = await getDocs(q);
          const fetchedSuggestions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date ? new Date(doc.data().date.seconds * 1000) : new Date(),
          }));
          setSuggestions(fetchedSuggestions);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          toast({
            variant: 'destructive',
            title: 'Failed to load suggestions',
            description: 'There was an error loading your suggestions. Please try again.',
          });
        }
      }
    }

    loadSuggestions();
  }, [user, toast]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
       {user && (
            <div className="absolute top-4 right-4">
              <Button onClick={handleLogout}>Logout</Button>
            </div>
          )}
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
             <Link href="/signup" className="text-blue-600 hover:underline">
                        Create an account
                    </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-4">
            <Button onClick={handleAddSuggestion}>Add New Suggestion</Button>
              <h2 className="text-2xl font-semibold mb-4">Your Suggestions</h2>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Assigned To</TableHead>
                          
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {suggestions.map(suggestion => (
                          <TableRow key={suggestion.id}>
                              <TableCell>{suggestion.title}</TableCell>
                              <TableCell>{suggestion.category}</TableCell>
                              <TableCell>{suggestion.status}</TableCell>
                              <TableCell>{format(suggestion.date, 'MM/dd/yyyy')}</TableCell>
                              <TableCell>{suggestion.assignedTo}</TableCell>
                              
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
            {user.role === 'admin' && (
              <Button onClick={() => router.push('/admin')}>Admin Dashboard</Button>
            )}
          </div>
        )}
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">
        <p>
          Powered by{' '}
          <a className="text-blue-600" href="https://example.com">
            Arek Peter Inc.
          </a>
        </p>
      </footer>
    </div>
  );
}

