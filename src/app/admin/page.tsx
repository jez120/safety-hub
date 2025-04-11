'use client';

import {useState, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

const sampleSuggestions = [
  {
    id: '1',
    title: 'Fire Safety Suggestion',
    category: 'Fire Safety',
    status: 'Open',
    description: 'Implement regular fire drills and ensure all fire extinguishers are easily accessible.',
  },
  {
    id: '2',
    title: 'Electrical Safety Suggestion',
    category: 'Electrical Safety',
    status: 'In Progress',
    description: 'Regularly inspect electrical cords and outlets for damage.',
  },
  {
    id: '3',
    title: 'Chemical Safety Suggestion',
    category: 'Chemical Safety',
    status: 'Closed',
    description: 'Improve labeling of chemical containers and provide better ventilation in storage areas.',
  },
  {
    id: '4',
    title: 'Fall Protection Suggestion',
    category: 'Fall Protection',
    status: 'Open',
    description: 'Install guardrails on elevated platforms and provide fall protection training.',
  },
];

export default function AdminPage() {
  const [suggestions, setSuggestions] = useState(sampleSuggestions);
  const [open, setOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  useEffect(() => {
    // Simulate fetching suggestions from an API
    // In a real application, you would fetch data from a database
    // and update the suggestions state accordingly.
  }, []);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setSuggestions(
      suggestions.map(suggestion =>
        suggestion.id === id ? {...suggestion, status: newStatus} : suggestion
      )
    );
  };

  const handleOpenDialog = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedSuggestion(null);
  };

  const handleSaveSuggestion = (updatedSuggestion) => {
    setSuggestions(
      suggestions.map(suggestion =>
        suggestion.id === updatedSuggestion.id ? updatedSuggestion : suggestion
      )
    );
    handleCloseDialog();
  };

  const suggestionCounts = suggestions.reduce(
    (acc, suggestion) => {
      acc[suggestion.status] = (acc[suggestion.status] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

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
        <h2 className="text-2xl font-semibold mb-4">Suggestion Management</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suggestions.map(suggestion => (
              <TableRow key={suggestion.id}>
                <TableCell>{suggestion.title}</TableCell>
                <TableCell>{suggestion.category}</TableCell>
                <TableCell>{suggestion.status}</TableCell>
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

  const handleSave = () => {
    const updatedSuggestion = {
      ...suggestion,
      title: title,
      category: category,
      status: status,
      description: description,
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
            <Input
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="col-span-3"
            />
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
