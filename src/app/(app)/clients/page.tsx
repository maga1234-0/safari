'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Client } from '@/lib/types';
import { PlusCircle, Edit, Trash, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query } from 'firebase/firestore';

export default function ClientsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'clients'));
  }, [firestore]);
  const { data: clients } = useCollection<Client>(clientsQuery);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [preferences, setPreferences] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setSelectedClient(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setAddress('');
    setPreferences('');
    setNotes('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (client: Client) => {
    setDialogMode('edit');
    setSelectedClient(client);
    setFirstName(client.firstName);
    setLastName(client.lastName);
    setEmail(client.email);
    setPhoneNumber(client.phoneNumber);
    setAddress(client.address || '');
    setPreferences(client.preferences || '');
    setNotes(client.notes || '');
    setDialogOpen(true);
  };
  
  const handleDelete = (clientId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'clients', clientId));
    toast({
      title: 'Client Deleted',
      description: 'The client has been removed from the database.',
    });
  };

  const handleSave = () => {
    if (!firstName || !lastName || !email || !phoneNumber || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields (First Name, Last Name, Email, Phone).',
      });
      return;
    }
    
    const clientData = {
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        preferences,
        notes
    };

    if (dialogMode === 'add') {
      addDocumentNonBlocking(collection(firestore, 'clients'), clientData);
      toast({
        title: 'Client Added',
        description: `${firstName} ${lastName} has been added to the client list.`,
      });
    } else if (dialogMode === 'edit' && selectedClient) {
      updateDocumentNonBlocking(doc(firestore, 'clients', selectedClient.id), clientData);
      toast({
        title: 'Client Updated',
        description: `${firstName} ${lastName}'s information has been updated.`,
      });
    }

    setDialogOpen(false);
  };
  
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter(client =>
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);


  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Client Management</h1>
      <p className="text-muted-foreground">Maintain client profiles, history, and preferences.</p>
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Clients</CardTitle>
            <CardDescription>View and manage all hotel clients.</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="w-full appearance-none bg-background pl-8 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients?.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{`${client.firstName} ${client.lastName}`}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phoneNumber}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(client)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(client.id)}>
                        <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Client
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Add New Client' : 'Edit Client'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' ? 'Fill in the details to add a new client.' : `Editing details for ${selectedClient?.firstName} ${selectedClient?.lastName}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">First Name</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. John" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Doe" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="e.g. john@example.com" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">Phone</Label>
              <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. +1 234 567 890" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Address</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Client's full address" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preferences" className="text-right">Preferences</Label>
              <Textarea id="preferences" value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="e.g. High floor, non-smoking" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any other relevant notes" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
