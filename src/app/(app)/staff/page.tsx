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
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, useAuth, initiateEmailSignUp } from '@/firebase';
import { collection, doc, query } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

const roleVariant: Record<StaffRole, BadgeProps['variant']> = {
  'Admin': 'destructive',
  'Reception': 'default',
  'Housekeeping': 'secondary',
};

export default function StaffPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();

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
      title: 'Staff Member Deleted',
      description: 'The staff member has been removed.',
    });
  };

  const handleSave = async () => {
    if (!name || !email || !role || !firestore || !auth) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields.',
      });
      return;
    }
    
    const staffData = { name, email, role: role as StaffRole };

    if (dialogMode === 'add') {
      try {
        if (role === 'Admin') {
          if (!password) {
            toast({
              variant: 'destructive',
              title: 'Password Required',
              description: 'Please assign a password for the new admin.',
            });
            return;
          }
          // Create the Firebase Auth user with the assigned password.
          await initiateEmailSignUp(auth, email, password);
        }
        
        // Add the staff member's details to the 'staff' collection in Firestore.
        addDocumentNonBlocking(collection(firestore, 'staff'), staffData);

        toast({
          title: 'Staff Member Added',
          description: role === 'Admin' 
            ? `${name} can now log in with their email and the assigned password.`
            : `${name} has been added to the staff list.`,
        });

      } catch (error) {
        if (error instanceof FirebaseError) {
          toast({
            variant: 'destructive',
            title: 'Error Creating Staff',
            description: error.code === 'auth/email-already-in-use' 
              ? 'An account with this email already exists.' 
              : error.message,
          });
        } else {
           toast({
            variant: 'destructive',
            title: 'An Unknown Error Occurred',
            description: 'Could not create the staff member.',
          });
        }
        return; // Prevent dialog from closing on error
      }
    } else if (dialogMode === 'edit' && selectedStaff) {
      updateDocumentNonBlocking(doc(firestore, 'staff', selectedStaff.id), staffData);
      toast({
        title: 'Staff Member Updated',
        description: `${name}'s information has been updated.`,
      });
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
      <h1 className="text-3xl font-bold font-headline tracking-tight">Staff Management</h1>
      <p className="text-muted-foreground">Manage staff roles and permissions.</p>
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Staff Members</CardTitle>
            <CardDescription>View and manage all staff accounts.</CardDescription>
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
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff?.map((staffMember) => (
                <TableRow key={staffMember.id}>
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
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Staff
          </Button>
        </CardFooter>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{dialogMode === 'add' ? 'Add New Staff Member' : 'Edit Staff Member'}</DialogTitle>
              <DialogDescription>
                {dialogMode === 'add' ? 'Fill in the details to add a new staff member.' : `Editing information for ${selectedStaff?.name}.`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. john@safari.com" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                 <Select value={role} onValueChange={(value: StaffRole) => setRole(value)}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Reception">Reception</SelectItem>
                        <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              {dialogMode === 'add' && role === 'Admin' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Assign a password" className="col-span-3" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
