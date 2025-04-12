'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { categories } from '@/app/admin/page';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import Link from 'next/link';

export default function NewSuggestionPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(categories[0] || '');
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Not authenticated',
                description: 'You must be logged in to submit a suggestion.',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const db = getFirestore(app);
            const suggestionsCollection = collection(db, 'suggestions');

            await addDoc(suggestionsCollection, {
                userId: user.uid,
                title: title,
                category: category,
                description: description,
                status: 'Open',
                date: new Date(),
                assignedTo: '',
                attachmentName: attachment ? attachment.name : null,
                // You would likely want to upload the file to Firebase Storage here and store the URL
                // attachmentUrl: await uploadFile(attachment),
            });

            toast({
                title: 'Suggestion submitted',
                description: 'Your suggestion has been submitted successfully.',
            });

            router.push('/user', { forceRefresh: true });
        } catch (error) {
            console.error('Error submitting suggestion:', error);
            toast({
                variant: 'destructive',
                title: 'Failed to submit suggestion',
                description: 'There was an error submitting your suggestion. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <Card className="w-96">
                    <CardHeader>
                        <CardTitle>Submit a Suggestion</CardTitle>
                        <CardDescription>
                            Fill out the form below to submit a new safety suggestion.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="Suggestion Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Detailed Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="attachment">Attachment</Label>
                                <Input
                                    id="attachment"
                                    type="file"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setAttachment(e.target.files[0]);
                                        }
                                    }}
                                />
                                {attachment && (
                                    <p>Selected file: {attachment.name}</p>
                                )}
                            </div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                            </Button>
                            <Link href="/user" className="text-blue-600 hover:underline">
                                Home
                            </Link>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

