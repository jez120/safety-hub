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
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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

    // Function to upload file and get URL
    const uploadFile = (file: File): Promise<string | null> => {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }
            const storage = getStorage(app);
            const filePath = `attachments/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, filePath);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                },
                (error) => {
                    console.error("Upload failed:", error);
                    toast({
                        variant: 'destructive',
                        title: 'Attachment Upload Failed',
                        description: error.message,
                    });
                    reject(error); // Reject the promise on upload error
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        console.log('File available at', downloadURL);
                        resolve(downloadURL);
                    }).catch((error) => {
                         console.error("Failed to get download URL:", error);
                         toast({
                             variant: 'destructive',
                             title: 'Attachment URL Failed',
                             description: 'Could not get the attachment URL after upload.',
                         });
                        reject(error); // Reject the promise if getting URL fails
                    });
                }
            );
        });
    };

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
        let attachmentUrl: string | null = null;
        let attachmentFilename: string | null = null;

        try {
            // Upload attachment if present
            if (attachment) {
                attachmentFilename = attachment.name;
                // Wrap uploadFile call in try/catch within this block
                try {
                    attachmentUrl = await uploadFile(attachment);
                } catch (uploadError) {
                    // Error handled within uploadFile (toast shown there)
                    setIsSubmitting(false);
                    return; // Stop submission if upload fails
                }
            }

            const db = getFirestore(app);
            const suggestionsCollection = collection(db, 'suggestions');

            // Add suggestion data to Firestore
            await addDoc(suggestionsCollection, {
                userId: user.uid,
                title: title,
                category: category,
                description: description,
                status: 'Open',
                date: serverTimestamp(),
                assignedTo: '',
                attachmentName: attachmentFilename,
                attachmentUrl: attachmentUrl,
            });

            toast({
                title: 'Suggestion submitted',
                description: 'Your suggestion has been submitted successfully.',
            });

            router.push('/user');

        } catch (error) {
            // Catch errors during Firestore addDoc or other unexpected issues
            console.error('Error submitting suggestion:', error);
            toast({
                variant: 'destructive',
                title: 'Failed to submit suggestion',
                description: 'There was an error saving your suggestion data. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // JSX part starts here
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Submit a Suggestion</CardTitle>
                        <CardDescription>
                            Fill out the form below to submit a new safety suggestion.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <Label htmlFor="title" className="text-left block mb-1">Title</Label>
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
                                <Label htmlFor="category" className="text-left block mb-1">Category</Label>
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
                                <Label htmlFor="description" className="text-left block mb-1">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Detailed Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={5}
                                />
                            </div>
                            <div>
                                <Label htmlFor="attachment" className="text-left block mb-1">Attachment (Optional)</Label>
                                <Input
                                    id="attachment"
                                    type="file"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setAttachment(e.target.files[0]);
                                        } else {
                                            setAttachment(null);
                                        }
                                    }}
                                />
                                {attachment && (
                                    <p className="text-sm text-muted-foreground text-left mt-1">Selected file: {attachment.name}</p>
                                )}
                            </div>
                            <Button type="submit" disabled={isSubmitting} className="mt-2">
                                {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                            </Button>
                            <Link href="/user" className="text-sm text-blue-600 hover:underline mt-2 text-center">
                                Cancel
                            </Link>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
