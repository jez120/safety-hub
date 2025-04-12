'use client';

import {useState, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {cn} from '@/lib/utils';
import {format} from 'date-fns';
import {CalendarIcon} from 'lucide-react';
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
  deleteDoc,
} from "firebase/firestore";
import {app} from '@/lib/firebase';
import {useToast} from '@/hooks/use-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
   const { toast } = useToast()

  useEffect(() => {
    async function loadSuggestions() {
      const db = getFirestore(app);
      const suggestionsCollection = collection(db, 'suggestions');
      const q = query(suggestionsCollection, orderBy('date', 'desc'));

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
             description: 'There was an error loading suggestions from the database.',
         });
      }
    }

    loadSuggestions();
  }, [toast]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
      try {
          const db = getFirestore(app);
          const suggestionDocRef = doc(db, 'suggestions', id);
          await updateDoc(suggestionDocRef, { status: newStatus });

          setSuggestions(
              suggestions.map(suggestion =>
                  suggestion.id === id ? { ...suggestion, status: newStatus } : suggestion
              )
          );
          toast({
              title: 'Suggestion updated',
              description: `Suggestion status updated to ${newStatus}.`,
          });
      } catch (error) {
          console.error('Error updating suggestion status:', error);
          toast({
              variant: 'destructive',
              title: 'Failed to update suggestion',
              description: 'There was an error updating the suggestion status.',
          });
      }
  };

  const handleOpenDialog = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedSuggestion(null);
  };

  const handleSaveSuggestion = async (updatedSuggestion) => {
       try {
           const db = getFirestore(app);
           const suggestionDocRef = doc(db, 'suggestions', updatedSuggestion.id);
           await updateDoc(suggestionDocRef, {
               title: updatedSuggestion.title,
               category: updatedSuggestion.category,
               status: updatedSuggestion.status,
               description: updatedSuggestion.description,
               assignedTo: updatedSuggestion.assignedTo,
           });

           setSuggestions(
               suggestions.map(suggestion =>
                   suggestion.id === updatedSuggestion.id ? updatedSuggestion : suggestion
               )
           );
           toast({
               title: 'Suggestion saved',
               description: 'Suggestion details have been updated successfully.',
           });
       } catch (error) {
           console.error('Error saving suggestion:', error);
           toast({
               variant: 'destructive',
               title: 'Failed to save suggestion',
               description: 'There was an error saving the suggestion details.',
           });
       }
    handleCloseDialog();
  };

  const suggestionCounts = suggestions.reduce(
    (acc, suggestion) => {
      acc[suggestion.status] = (acc[suggestion.status] || 0) + 1;
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
          'rgba(255, 206, 86, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Suggestions</CardTitle>
            <CardDescription>All submitted safety suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suggestions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Suggestions</CardTitle>
            <CardDescription>Suggestions that are still pending action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suggestionCounts.Open || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Closed Suggestions</CardTitle>
            <CardDescription>Suggestions that have been resolved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suggestionCounts.Closed || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Suggestion Statistics</h2>
        <Bar options={chartOptions} data={chartData} />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Suggestion Management</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => handleOpenDialog(suggestion)}>
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedSuggestion && (
        <SuggestionDialog
          open={open}
          onClose={handleCloseDialog}
          suggestion={selectedSuggestion}
          onSave={handleSaveSuggestion}
        />
      )}
    </div>
  );
}

function SuggestionDialog({open, onClose, suggestion, onSave}) {
  const [title, setTitle] = useState(suggestion.title);
  const [category, setCategory] = useState(suggestion.category);
  const [status, setStatus] = useState(suggestion.status);
  const [description, setDescription] = useState(suggestion.description);
  const [assignedTo, setAssignedTo] = useState(suggestion.assignedTo);

  const handleSave = () => {
    const updatedSuggestion = {
      ...suggestion,
      title: title,
      category: category,
      status: status,
      description: description,
      assignedTo: assignedTo,
    };
    onSave(updatedSuggestion);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Suggestion</DialogTitle>
          <DialogDescription>
            Make changes to the suggestion details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignedTo" className="text-right">
              Assigned To
            </Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Assign a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
