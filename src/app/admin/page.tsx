import {useState, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {cn} from '@/lib/utils';
import {format} from 'date-fns';
import { Timestamp, getDoc } from 'firebase/firestore'; // Import Timestamp & getDoc
import { ExternalLink, Paperclip } from 'lucide-react'; // Removed unused CalendarIcon, Added Paperclip
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Link from 'next/link';
import {
  collection,
  query,
  orderBy,
  getDocs,
  getFirestore,
  doc,
  updateDoc,
} from "firebase/firestore";
import {app, auth} from '@/lib/firebase';
import {useToast} from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { signOut } from 'firebase/auth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define Suggestion interface (can be moved to a types file)
interface Suggestion {
    id: string;
    title: string;
    category: string;
    status: string;
    description: string;
    date: Date | Timestamp; // Allow both Date and Timestamp
    assignedTo?: string;
    attachmentName?: string;
    attachmentUrl?: string;
    userId: string;
    // Add other fields as necessary
}

const categories = [
  "Fire Safety",
  "Electrical Safety",
  "Chemical Safety",
  "Fall Protection",
  "Machine Guarding",
  "Personal Protective Equipment",
  "Hazard Communication",
  "Ergonomics",
  "Other"
];

// Ideally, fetch this list from Firestore or your user management system
const users = [
  "John Doe",
  "Jane Smith",
  "Robert Jones",
  "Emily White"
];

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Suggestion Status Chart',
    },
  },
};

export {categories, users}

export default function AdminPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    async function loadSuggestions() {
      const db = getFirestore(app);
      const suggestionsCollection = collection(db, 'suggestions');
      const q = query(suggestionsCollection, orderBy('date', 'desc'));
      try {
        const querySnapshot = await getDocs(q);
        const fetchedSuggestions = querySnapshot.docs.map(doc => {
             const data = doc.data();
             const date = data.date instanceof Timestamp ? data.date.toDate() : (data.date ? new Date(data.date) : new Date());
             return {
                 id: doc.id,
                 ...data,
                 date: date,
             } as Suggestion;
        });
        setSuggestions(fetchedSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        toast({ variant: 'destructive', title: 'Failed to load suggestions', description: 'There was an error loading suggestions from the database.' });
      }
    }

    async function checkAdmin() {
        if (!user) {
            return;
        }
        try {
            const db = getFirestore(app);
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists() && docSnap.data().role === 'admin') {
                loadSuggestions();
            } else {
                toast({
                    title: "Unauthorized",
                    description: "You do not have permission to access this page.", variant: "destructive"
                });
                router.push('/');
            }
        } catch (error) {
             console.error("Error checking admin status:", error);
             toast({ title: "Error", description: "Could not verify admin status.", variant: "destructive" });
             router.push('/');
        }
    }

      if (!loading) {
          checkAdmin();
      }
  }, [user, loading, router, toast]);

    if (loading || (!user && typeof window !== 'undefined')) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!user) {
         router.push('/');
         return null;
    }


  const handleOpenDialog = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedSuggestion(null);
  };

  const handleSaveSuggestionInDialog = (updatedSuggestion: Suggestion) => {
      setSuggestions(prevSuggestions =>
          prevSuggestions.map(s =>
              s.id === updatedSuggestion.id ? updatedSuggestion : s
          )
      );
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

  const suggestionCounts = suggestions.reduce(
    (acc, suggestion) => {
      const status = suggestion.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  const chartData = {
    labels: Object.keys(suggestionCounts),
    datasets: [
      {
        label: 'Number of Suggestions',
        data: Object.values(suggestionCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Admin Dashboard</h1>
         <Button type="button" variant="outline" onClick={handleSignOut}>
           Log Off
         </Button>
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suggestions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suggestionCounts.Open || 0}</div>
          </CardContent>
        </Card>
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium">In Progress</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{suggestionCounts['In Progress'] || 0}</div>
           </CardContent>
         </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suggestionCounts.Closed || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Card */}
      <Card className="mb-8">
           <CardHeader>
                <CardTitle>Suggestion Status</CardTitle>
           </CardHeader>
           <CardContent>
                <div className="h-[300px] flex justify-center items-center">
                    <Bar options={chartOptions} data={chartData} />
                </div>
            </CardContent>
      </Card>


      {/* Suggestions Table Card */}
       <Card>
          <CardHeader>
               <CardTitle>Suggestion Management</CardTitle>
               <CardDescription>View and manage all submitted suggestions.</CardDescription>
          </CardHeader>
          <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>{/* Trimmed whitespace */}
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden sm:table-cell">Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                      <TableHead>Attachment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestions.map(suggestion => (
                      // Ensure no whitespace between elements in the fragment/row
                      <TableRow key={suggestion.id}>
                        <TableCell className="font-medium">{suggestion.title}</TableCell>
                        <TableCell className="hidden sm:table-cell">{suggestion.category}</TableCell>
                        <TableCell>{suggestion.status}</TableCell>
                        <TableCell className="hidden md:table-cell">{suggestion.date ? format(suggestion.date as Date, 'MM/dd/yyyy') : 'N/A'}</TableCell>
                        <TableCell className="hidden lg:table-cell">{suggestion.assignedTo || '-'}</TableCell>
                        <TableCell>
                            {suggestion.attachmentUrl ? (
                                <a href={suggestion.attachmentUrl} target="_blank" rel="noopener noreferrer" title={suggestion.attachmentName || 'View Attachment'} className="inline-flex items-center text-blue-600 hover:underline">
                                    <Paperclip className="h-4 w-4" /><span className="sr-only">View Attachment</span>
                                </a>
                            ) : (
                                '-'
                            )}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => handleOpenDialog(suggestion)}>Manage</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {suggestions.length === 0 && (
                    <div className="text-center p-4 text-muted-foreground">
                        No suggestions found.
                    </div>
                )}
          </CardContent>
       </Card>

      {selectedSuggestion && (
        <SuggestionDialog
          open={open}
          onClose={handleCloseDialog}
          suggestion={selectedSuggestion}
          onSave={handleSaveSuggestionInDialog}
          toast={toast}
          db={getFirestore(app)}
        />
      )}
    </div>
  );
}


interface SuggestionDialogProps {
    open: boolean;
    onClose: () => void;
    suggestion: Suggestion;
    onSave: (updatedSuggestion: Suggestion) => void;
    toast: any;
    db: any;
}

function SuggestionDialog({open, onClose, suggestion, onSave, toast, db}: SuggestionDialogProps) {
  const [title, setTitle] = useState(suggestion.title);
  const [category, setCategory] = useState(suggestion.category);
  const [status, setStatus] = useState(suggestion.status);
  const [description, setDescription] = useState(suggestion.description);
  const [assignedTo, setAssignedTo] = useState(suggestion.assignedTo || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
      setTitle(suggestion.title);
      setCategory(suggestion.category);
      setStatus(suggestion.status);
      setDescription(suggestion.description);
      setAssignedTo(suggestion.assignedTo || '');
  }, [suggestion]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const updatedSuggestionData = {
        title: title,
        category: category,
        status: status,
        description: description,
        assignedTo: assignedTo,
    };

    try {
       const suggestionDocRef = doc(db, 'suggestions', suggestion.id);
       await updateDoc(suggestionDocRef, updatedSuggestionData);
       const updatedLocalSuggestion = { ...suggestion, ...updatedSuggestionData };
       onSave(updatedLocalSuggestion);
       toast({
           title: 'Suggestion Saved',
           description: 'Changes have been saved successfully.',
       });
       onClose();
    } catch (error) {
        console.error('Error saving suggestion:', error);
        toast({
            variant: 'destructive',
            title: 'Failed to Save',
            description: 'There was an error saving the changes.',
        });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Suggestion</DialogTitle>
          <DialogDescription>
            View or modify the suggestion details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dialog-title" className="text-right">Title</Label>
            <Input id="dialog-title" value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" />
          </div>
           {/* Category */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dialog-category" className="text-right">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat ?? ""}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dialog-status" className="text-right">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
           {/* Assigned To */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dialog-assignedTo" className="text-right">Assigned To</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Assign a user" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem key="unassigned" value="">* Unassigned *</SelectItem>
                {users.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           {/* Description */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="dialog-description" className="text-right pt-1">Description</Label>
            <Textarea id="dialog-description" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" rows={4} />
          </div>
           {/* Attachment Link */}
          {suggestion.attachmentUrl && (
             <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Attachment</Label>
                <div className="col-span-3">
                    <a href={suggestion.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-blue-600 hover:underline">
                         <Paperclip className="mr-1 h-4 w-4" /> {suggestion.attachmentName || 'View Attachment'}
                    </a>
                </div>
            </div>
           )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button type="button" onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

