'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { Room, RoomStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
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

const roomStatusVariant: Record<RoomStatus, BadgeProps['variant']> = {
  'Available': 'success',
  'Occupied': 'warning',
  'Maintenance': 'destructive',
};

export default function RoomsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();
  
  const roomsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'rooms'));
  }, [firestore]);
  const { data: rooms } = useCollection<Room>(roomsQuery);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState<Room['type'] | ''>('');
  const [status, setStatus] = useState<RoomStatus | ''>('');
  const [price, setPrice] = useState('');

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setSelectedRoom(null);
    setRoomNumber('');
    setType('');
    setStatus('');
    setPrice('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (room: Room) => {
    setDialogMode('edit');
    setSelectedRoom(room);
    setRoomNumber(String(room.roomNumber));
    setType(room.type);
    setStatus(room.status);
    setPrice(String(room.price));
    setDialogOpen(true);
  };

  const handleBookNow = (room: Room) => {
    router.push(`/reservations?roomId=${room.id}`);
  };
  
  const handleDelete = (roomId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'rooms', roomId));
    toast({
      title: 'Room Deleted',
      description: 'The room has been removed.',
    });
  };

  const handleSave = () => {
    if (!roomNumber || !type || !status || !price || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields.',
      });
      return;
    }

    const priceValue = parseFloat(price);
    const roomNumberValue = parseInt(roomNumber, 10);

    if (isNaN(priceValue) || isNaN(roomNumberValue)) {
        toast({
            variant: 'destructive',
            title: 'Invalid Input',
            description: 'Room number and price must be valid numbers.',
        });
        return;
    }
    
    const roomData = {
        roomNumber: roomNumberValue,
        type: type as Room['type'],
        status: status as RoomStatus,
        price: priceValue,
    };

    if (dialogMode === 'add') {
      addDocumentNonBlocking(collection(firestore, 'rooms'), roomData);
      toast({
        title: 'Room Added',
        description: `Room ${roomNumberValue} has been added.`,
      });
    } else if (dialogMode === 'edit' && selectedRoom) {
      updateDocumentNonBlocking(doc(firestore, 'rooms', selectedRoom.id), roomData);
      toast({
        title: 'Room Updated',
        description: `Room ${roomNumber}'s information has been updated.`,
      });
    }

    setDialogOpen(false);
  };
  
  const filteredRooms = rooms?.filter(room =>
    room.roomNumber.toString().includes(searchTerm) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Room Management</h1>
      <p className="text-muted-foreground">Track room availability, status, and details.</p>
      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Rooms</CardTitle>
            <CardDescription>View and manage all rooms in the hotel.</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by room or type..."
              className="w-full appearance-none bg-background pl-8 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="grid gap-4 md:hidden">
            {filteredRooms?.map((room) => (
              <Card key={room.id}>
                <CardHeader className="flex flex-row items-center justify-between p-4">
                  <div>
                    <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                    <CardDescription>{room.type}</CardDescription>
                  </div>
                  <div className="text-lg font-bold">${room.price.toFixed(2)}</div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Badge variant={roomStatusVariant[room.status]}>{room.status}</Badge>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(room)}>
                          <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(room.id)}>
                          <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    {room.status === 'Available' && (
                        <Button onClick={() => handleBookNow(room)} size="sm">Book Now</Button>
                    )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room No.</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms?.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.roomNumber}</TableCell>
                    <TableCell>{room.type}</TableCell>
                    <TableCell>
                      <Badge variant={roomStatusVariant[room.status]}>
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${room.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {room.status === 'Available' && (
                          <Button onClick={() => handleBookNow(room)} size="sm" className="mr-2">Book Now</Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(room)}>
                          <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(room.id)}>
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
            <PlusCircle className="mr-2 h-4 w-4" /> Add Room
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Add New Room' : 'Edit Room'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' ? 'Fill in the details to add a new room.' : `Editing details for room ${selectedRoom?.roomNumber}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roomNumber">
                Room No.
              </Label>
              <Input id="roomNumber" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} type="number" placeholder="e.g. 101" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">
                Type
              </Label>
               <Select value={type} onValueChange={(value: Room['type']) => setType(value)}>
                  <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Double">Double</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">
                Status
              </Label>
               <Select value={status} onValueChange={(value: RoomStatus) => setStatus(value)}>
                  <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Occupied">Occupied</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">
                Price
              </Label>
              <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="e.g. 150" />
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
