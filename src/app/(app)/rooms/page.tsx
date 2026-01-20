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
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { rooms as initialRooms } from '@/lib/data';
import type { Room, RoomStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
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

const roomStatusVariant: Record<RoomStatus, BadgeProps['variant']> = {
  'Available': 'default',
  'Occupied': 'secondary',
  'Maintenance': 'destructive',
};

export default function RoomsPage() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

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

  const handleSave = () => {
    if (!roomNumber || !type || !status || !price) {
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

    if (dialogMode === 'add') {
      const newRoom: Room = {
        id: `R${Math.floor(Math.random() * 1000) + 400}`, // In a real app, use a better ID generation
        roomNumber: roomNumberValue,
        type: type as Room['type'],
        status: status as RoomStatus,
        price: priceValue,
      };
      setRooms([...rooms, newRoom]);
      toast({
        title: 'Room Added',
        description: `Room ${newRoom.roomNumber} has been added.`,
      });
    } else if (dialogMode === 'edit' && selectedRoom) {
      setRooms(rooms.map(r =>
        r.id === selectedRoom.id
        ? { ...r, roomNumber: roomNumberValue, type: type as Room['type'], status: status as RoomStatus, price: priceValue }
        : r
      ));
      toast({
        title: 'Room Updated',
        description: `Room ${roomNumber}'s information has been updated.`,
      });
    }

    setDialogOpen(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Room Management</h1>
      <p className="text-muted-foreground">Track room availability, status, and details.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
          <CardDescription>View and manage all rooms in the hotel.</CardDescription>
        </CardHeader>
        <CardContent>
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
              {rooms.map((room) => (
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(room)}>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roomNumber" className="text-right">
                Room No.
              </Label>
              <Input id="roomNumber" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} type="number" placeholder="e.g. 101" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
               <Select value={type} onValueChange={(value: Room['type']) => setType(value)}>
                  <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Double">Double</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
               <Select value={status} onValueChange={(value: RoomStatus) => setStatus(value)}>
                  <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Occupied">Occupied</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="e.g. 150" className="col-span-3" />
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
