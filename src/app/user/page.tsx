'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell, TableCaption } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { signOut } from 'firebase/auth'
import { Timestamp } from 'firebase/firestore'; // Import Timestamp
import { auth, app } from '@/lib/firebase'
import {
    collection,
    query,
    orderBy,
    getDocs,
    getFirestore,
    where,
} from "firebase/firestore";
// Removed Router import as it's not used directly
import Link from 'next/link';
import { ExternalLink } from 'lucide-react'; // Import an icon for the link

interface Suggestion {
    id: string;
    title: string;
    category: string;
    status: string;
    date: Date | Timestamp; // Allow both Date and Timestamp
    assignedTo?: string;
    attachmentName?: string;
    attachmentUrl?: string;
    // Add other fields as necessary
}

export default function UserDashboard() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]); // Use Suggestion interface
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
                orderBy('date', 'desc'),
                where('userId', '==', user.uid)
            );

            try {
                const querySnapshot = await getDocs(q);
                const fetchedSuggestions = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    // Convert Firestore Timestamp to JS Date if necessary
                    const date = data.date instanceof Timestamp ? data.date.toDate() : (data.date ? new Date(data.date) : new Date());
                    return {
                        id: doc.id,
                        ...data,
                        date: date,
                    } as Suggestion; // Cast to Suggestion
                });

                console.log('Fetched Suggestions:', fetchedSuggestions);
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
    }, [user, loading, router, toast]);

    useEffect(() => {
        console.log('Suggestions state updated:', suggestions);
    }, [suggestions]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!user) {
        // This part might cause issues during initial load if user is briefly null
        // Consider showing a loading state or handling redirect more gracefully
        // router.push('/');
        return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>; // Or a better loading/redirect indicator
    }

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Sign out failed', error);
             toast({ // Add toast for sign out error
                 variant: 'destructive',
                 title: 'Sign Out Failed',
                 description: 'Could not sign out. Please try again.',
             });
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-6">
                <Button onClick={handleSignOut} variant="outline" className="absolute top-4 right-4">Log Off</Button>
            </div>
             <div className="flex flex-col items-center mb-6">
                  <Button asChild variant="link" className="mb-4">
                    <Link href="/">Home</Link>
                  </Button>
                 {user.displayName && <p className="text-lg">Welcome, {user.displayName}!</p>}
                 <h1 className="text-2xl font-bold text-center flex-grow">Your Dashboard</h1>
            </div>

            <Card className="mb-8">
                <CardHeader>
                     <CardTitle>Your Suggestions</CardTitle>
                     <CardDescription>Suggestions you have submitted.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Attachment</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suggestions && suggestions.length > 0 ? (
                                suggestions.map(suggestion => (
                                    <TableRow key={suggestion.id}>
                                        <TableCell className="font-medium">{suggestion.title}</TableCell>
                                        <TableCell>{suggestion.category}</TableCell>
                                        <TableCell>{suggestion.status}</TableCell>
                                        <TableCell>{suggestion.date ? format(suggestion.date as Date, 'MM/dd/yyyy') : 'N/A'}</TableCell>
                                        <TableCell>{suggestion.assignedTo || '-'}</TableCell>
                                        <TableCell>
                                            {suggestion.attachmentUrl ? (
                                                <a
                                                    href={suggestion.attachmentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-blue-600 hover:underline"
                                                >
                                                    {suggestion.attachmentName || 'View Attachment'} <ExternalLink className="ml-1 h-4 w-4" />
                                                </a>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No suggestions submitted yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button asChild>
                  <Link href="/new-suggestion">Submit New Suggestion</Link>
              </Button>
            </div>
        </div>
    );
}

