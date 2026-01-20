'use client';

import { useState } from 'react';
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
import { staffMembers } from '@/lib/data';
import type { StaffMember, StaffRole } from '@/lib/types';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash } from 'lucide-react';
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

const roleVariant: Record<StaffRole, BadgeProps['variant']> = {
  'Admin': 'destructive',
  'Reception': 'default',
  'Housekeeping': 'secondary',
};

export default function StaffPage() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>(staffMembers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole | ''>('');

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setSelectedStaff(null);
    setName('');
    setEmail('');
    setRole('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (staffMember: StaffMember) => {
    setDialogMode('edit');
    setSelectedStaff(staffMember);
    setName(staffMember.name);
    setEmail(staffMember.email);
    setRole(staffMember.role);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name || !email || !role) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields.',
      });
      return;
    }

    if (dialogMode === 'add') {
      const newStaffMember: StaffMember = {
        id: `S${(staff.length + 10).toString().padStart(3, '0')}`, // Use a more robust ID in a real app
        name,
        email,
        role: role as StaffRole,
      };
      setStaff([...staff, newStaffMember]);
      toast({
        title: 'Staff Member Added',
        description: `${name} has been added to the staff list.`,
      });
    } else if (dialogMode === 'edit' && selectedStaff) {
      setStaff(staff.map(member => 
        member.id === selectedStaff.id 
        ? { ...member, name, email, role: role as StaffRole } 
        : member
      ));
      toast({
        title: 'Staff Member Updated',
        description: `${name}'s information has been updated.`,
      });
    }

    setDialogOpen(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Staff Management</h1>
      <p className="text-muted-foreground">Manage staff roles and permissions.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Staff Members</CardTitle>
          <CardDescription>View and manage all staff accounts.</CardDescription>
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
              {staff.map((staffMember) => (
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
