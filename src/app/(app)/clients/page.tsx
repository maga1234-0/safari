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
      title: 'Client Supprimé',
      description: 'Le client a été retiré de la base de données.',
    });
  };

  const handleSave = () => {
    if (!firstName || !lastName || !email || !phoneNumber || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Informations Manquantes',
        description: 'Veuillez remplir tous les champs obligatoires (Prénom, Nom, Email, Téléphone).',
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
        title: 'Client Ajouté',
        description: `${firstName} ${lastName} a été ajouté à la liste des clients.`,
      });
    } else if (dialogMode === 'edit' && selectedClient) {
      updateDocumentNonBlocking(doc(firestore, 'clients', selectedClient.id), clientData);
      toast({
        title: 'Client Mis à Jour',
        description: `Les informations de ${firstName} ${lastName} ont été mises à jour.`,
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
      <h1 className="text-3xl font-bold font-headline tracking-tight">Gestion des Clients</h1>
      <p className="text-muted-foreground">Maintenez les profils, l'historique et les préférences des clients.</p>
      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Tous les Clients</CardTitle>
            <CardDescription>Voir et gérer tous les clients de l'hôtel.</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par nom ou email..."
              className="w-full appearance-none bg-background pl-8 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile view */}
          <div className="grid gap-4 md:hidden">
            {filteredClients?.map((client, index) => (
              <Card
                key={client.id}
                className="animate-slide-in-from-bottom transition-shadow duration-300 hover:shadow-md"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{`${client.firstName} ${client.lastName}`}</CardTitle>
                  <CardDescription>{client.email}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">{client.phoneNumber}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(client)}>
                      <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(client.id)}>
                      <Trash className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Desktop view */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Numéro de Téléphone</TableHead>
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
          </div>
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Client
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Ajouter un Nouveau Client' : 'Modifier le Client'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' ? "Remplissez les détails pour ajouter un nouveau client." : `Modification des détails pour ${selectedClient?.firstName} ${selectedClient?.lastName}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. John" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="lastName">Nom de famille</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="e.g. john@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Téléphone</Label>
              <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. +1 234 567 890" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse complète du client" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="preferences">Préférences</Label>
              <Textarea id="preferences" value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="e.g. Étage élevé, non-fumeur" />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="notes">Remarques</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Toutes autres remarques pertinentes" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Sauvegarder les modifications</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
