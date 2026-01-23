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
import type { StaffMember, StaffRole } from '@/lib/types';
import { Badge, type BadgeProps } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query } from 'firebase/firestore';
import { FirebaseError, initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, type UserCredential } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

const roleVariant: Record<StaffRole, BadgeProps['variant']> = {
  'Admin': 'destructive',
  'Réception': 'default',
  'Entretien ménager': 'secondary',
};

const createAuthUserWithoutSigningOut = async (email: string, password: string): Promise<UserCredential> => {
  const tempAppName = `temp-signup-${Date.now()}`;
  const tempApp = initializeApp(firebaseConfig, tempAppName);
  const tempAuth = getAuth(tempApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
    return userCredential;
  } finally {
    await deleteApp(tempApp);
  }
};

export default function StaffPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const staffQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'staff'));
  }, [firestore]);
  const { data: staff } = useCollection<StaffMember>(staffQuery);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole | ''>('');
  const [password, setPassword] = useState('');

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setSelectedStaff(null);
    setName('');
    setEmail('');
    setRole('');
    setPassword('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (staffMember: StaffMember) => {
    setDialogMode('edit');
    setSelectedStaff(staffMember);
    setName(staffMember.name);
    setEmail(staffMember.email);
    setRole(staffMember.role);
    setPassword('');
    setDialogOpen(true);
  };
  
  const handleDelete = (staffId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'staff', staffId));
    toast({
      title: 'Membre du Personnel Supprimé',
      description: 'Le membre du personnel a été supprimé.',
    });
  };

  const handleSave = async () => {
    if (!name || !email || !role || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Informations Manquantes',
        description: 'Veuillez remplir les champs Nom, Email et Rôle.',
      });
      return;
    }
    
    const staffData: Partial<StaffMember> = { name, email, role: role as StaffRole };

    if (dialogMode === 'add') {
      if (!password) {
        toast({
          variant: 'destructive',
          title: 'Mot de Passe Requis',
          description: 'Veuillez attribuer un mot de passe pour le nouveau membre du personnel.',
        });
        return;
      }
      try {
        const userCredential = await createAuthUserWithoutSigningOut(email, password);
        staffData.uid = userCredential.user.uid;
        
        addDocumentNonBlocking(collection(firestore, 'staff'), staffData);

        toast({
          title: 'Membre du Personnel Ajouté',
          description: `${name} peut maintenant se connecter avec son email et le mot de passe attribué.`,
        });

      } catch (error) {
        let description = 'Impossible de créer le membre du personnel.';
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case 'auth/email-already-in-use':
              description = 'Un compte avec cet email existe déjà.';
              break;
            case 'auth/invalid-email':
              description = "L'adresse email n'est pas valide.";
              break;
            case 'auth/weak-password':
              description = 'Le mot de passe doit contenir au moins 6 caractères.';
              break;
            default:
              description = `Une erreur est survenue: ${error.message}`;
          }
        }
        toast({
          variant: 'destructive',
          title: 'Erreur lors de la Création du Personnel',
          description: description,
        });
        return;
      }
    } else if (dialogMode === 'edit' && selectedStaff) {
      try {
          if (selectedStaff.uid && password) {
             toast({
                variant: 'destructive',
                title: 'Modification du Mot de Passe Non Prise en Charge',
                description: "Pour des raisons de sécurité, la modification directe du mot de passe n'est pas possible. Le membre du personnel doit changer son propre mot de passe via la page des paramètres.",
            });
            return;
          }

          if (!selectedStaff.uid && password) {
             const userCredential = await createAuthUserWithoutSigningOut(email, password);
             staffData.uid = userCredential.user.uid;
             toast({
              title: 'Identifiants Créés',
              description: `Le membre du personnel ${name} peut maintenant se connecter.`,
            });
          } else {
            staffData.uid = selectedStaff.uid;
          }

          updateDocumentNonBlocking(doc(firestore, 'staff', selectedStaff.id), staffData);
          toast({
            title: 'Membre du Personnel Mis à Jour',
            description: `Les informations de ${name} ont été mises à jour.`,
          });
      } catch(error) {
          let description = 'Impossible de mettre à jour le membre du personnel.';
          if (error instanceof FirebaseError) {
            switch (error.code) {
              case 'auth/email-already-in-use':
                description = 'Un compte avec cet email existe déjà.';
                break;
              case 'auth/invalid-email':
                description = "L'adresse email n'est pas valide.";
                break;
              case 'auth/weak-password':
                description = 'Le mot de passe doit contenir au moins 6 caractères.';
                break;
              default:
                description = `Une erreur est survenue: ${error.message}`;
            }
          }
          toast({
            variant: 'destructive',
            title: 'Erreur lors de la Mise à Jour du Personnel',
            description: description,
          });
          return;
      }
    }

    setDialogOpen(false);
  };

  const filteredStaff = useMemo(() => {
    if (!staff) return [];
    return staff.filter(staffMember =>
      staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staff, searchTerm]);

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Gestion du Personnel</h1>
      <p className="text-muted-foreground">Gérer les rôles et les autorisations du personnel.</p>
      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Tous les Membres du Personnel</CardTitle>
            <CardDescription>Voir et gérer tous les comptes du personnel.</CardDescription>
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
          {/* Mobile View */}
          <div className="grid gap-4 md:hidden">
            {filteredStaff?.map((staffMember, index) => (
              <Card
                key={staffMember.id}
                className="animate-slide-in-from-bottom transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{staffMember.name}</CardTitle>
                        <CardDescription>{staffMember.email}</CardDescription>
                      </div>
                      <Badge variant={roleVariant[staffMember.role]}>{staffMember.role}</Badge>
                    </div>
                </CardHeader>
                <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(staffMember)}>
                      <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(staffMember.id)}>
                      <Trash className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff?.map((staffMember, index) => (
                  <TableRow key={staffMember.id} className="animate-slide-in-from-bottom" style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}>
                    <TableCell className="font-medium">{staffMember.name}</TableCell>
                    <TableCell>{staffMember.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleVariant[staffMember.role]}>{staffMember.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(staffMember)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(staffMember.id)}>
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
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Membre
          </Button>
        </CardFooter>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{dialogMode === 'add' ? 'Ajouter un Nouveau Membre du Personnel' : 'Modifier le Membre du Personnel'}</DialogTitle>
              <DialogDescription>
                {dialogMode === 'add' ? "Remplissez les détails pour ajouter un nouveau membre du personnel." : `Modification des informations pour ${selectedStaff?.name}.`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Nom
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email
                </Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. john@safari.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">
                  Rôle
                </Label>
                 <Select value={role} onValueChange={(value: StaffRole) => setRole(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Réception">Réception</SelectItem>
                        <SelectItem value="Entretien ménager">Entretien ménager</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">
                  Mot de passe
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder={dialogMode === 'add' ? 'Attribuer un mot de passe (requis)' : 'Laisser vide pour ne pas changer'}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Sauvegarder les modifications</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
