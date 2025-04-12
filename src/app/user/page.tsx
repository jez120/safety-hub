'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  collection,
  query,
  orderBy,
  getDocs,
  getFirestore,
  where,
} from "firebase/firestore";
import { app } from '@/lib/firebase';

export default function UserDashboard() {
  const [suggestions, setSuggestions] = useState([]);
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function loadSuggestions() {
      if (!user) return;

      const db = getFirestore(app);
      const suggestionsCollection = collection(db, 'suggestions');
      const q = query(
        suggestionsCollection,
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );

      try {
        const querySnapshot = await getDocs(q);
        const fetchedSuggestions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date ? new Date(doc.data().date.seconds * 1000) : new Date(),
        })).filter(suggestion => suggestion.date instanceof Date); // Ensure date is a Date object
        setSuggestions(fetchedSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load suggestions',
          description: 'There was an error loading your suggestions from the database.',
        });
      }
    }

    if (!loading && user) {
      loadSuggestions();
    }
  }, [user, loading, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/'); // Redirect to login if not authenticated
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center">User Dashboard</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Home
        </Link>
      </div>

      <div className="mb-8">
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
            {suggestions.length > 0 ? (
              suggestions.map(suggestion => (
                <TableRow key={suggestion.id}>
                  <TableCell>{suggestion.title}</TableCell>
                  <TableCell>{suggestion.category}</TableCell>
                  <TableCell>{suggestion.status}</TableCell>
                  <TableCell>{format(suggestion.date, 'MM/dd/yyyy')}</TableCell>
                  <TableCell>{suggestion.assignedTo}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No suggestions submitted yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Button asChild>
        <Link href="/new-suggestion">Submit New Suggestion</Link>
      </Button>
    </div>
  );
}

