'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
import type { Booking, BookingStatus } from '@/lib/types';
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
import { format, toDate, parse } from 'date-fns';
import { useCollection, useFirestore, useUser, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, serverTimestamp } from 'firebase/firestore';

const bookingStatusVariant: Record<BookingStatus, BadgeProps['variant']> = {
  'Confirmed': 'success',
  'Pending': 'warning',
  'Cancelled': 'destructive',
  'CheckedIn': 'default',
  'CheckedOut': 'secondary',
  'Reserved': 'default',
};

function toDateSafe(date: any): Date {
  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  return toDate(date);
}

export default function ReservationsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'reservations'));
  }, [firestore]);
  const { data: bookings } = useCollection<Booking>(bookingsQuery);

  const roomsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'rooms'));
  }, [firestore]);
  const { data: rooms } = useCollection<any>(roomsQuery);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [clientName, setClientName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [status, setStatus] = useState<BookingStatus | ''>('');

  useEffect(() => {
    const roomIdFromQuery = searchParams.get('roomId');
    if (roomIdFromQuery && rooms && !prefilled) {
      const roomExists = rooms.some(r => r.id === roomIdFromQuery);
      if (roomExists) {
        setDialogMode('add');
        setSelectedBooking(null);
        setClientName('');
        setRoomId(roomIdFromQuery);
        setCheckIn(undefined);
        setCheckOut(undefined);
        setStatus('Pending');
        setDialogOpen(true);
        setPrefilled(true);
      }
    }
  }, [searchParams, rooms, prefilled]);

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setSelectedBooking(null);
    setClientName('');
    setRoomId('');
    setCheckIn(undefined);
    setCheckOut(undefined);
    setStatus('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (booking: Booking) => {
    setDialogMode('edit');
    setSelectedBooking(booking);
    setClientName(booking.clientName);
    setRoomId(booking.roomId);
    setCheckIn(toDateSafe(booking.checkIn));
    setCheckOut(toDateSafe(booking.checkOut));
    setStatus(booking.status);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!clientName || !roomId || !checkIn || !checkOut || !status || !user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields.',
      });
      return;
    }
    
    const selectedRoom = rooms?.find(r => r.id === roomId);
    if (!selectedRoom) {
        toast({
            variant: 'destructive',
            title: 'Invalid Room',
            description: 'The selected room does not exist.',
        });
        return;
    }

    const roomRef = doc(firestore, 'rooms', roomId);
    const newRoomStatus = status === 'Cancelled' || status === 'CheckedOut' ? 'Available' : 'Occupied';

    if (dialogMode === 'add') {
      const newBooking = {
        clientId: user.uid,
        clientName,
        roomId,
        roomNumber: selectedRoom.roomNumber,
        checkIn,
        checkOut,
        status: status as BookingStatus,
        createdAt: serverTimestamp(),
        pricePerNight: selectedRoom.price,
      };
      addDocumentNonBlocking(collection(firestore, 'reservations'), newBooking);
      updateDocumentNonBlocking(roomRef, { status: newRoomStatus });
      toast({
        title: 'Reservation Added',
        description: `Booking for ${clientName} has been created.`,
      });
    } else if (dialogMode === 'edit' && selectedBooking) {
      if (selectedBooking.roomId !== roomId) {
        const oldRoomRef = doc(firestore, 'rooms', selectedBooking.roomId);
        updateDocumentNonBlocking(oldRoomRef, { status: 'Available' });
      }
      
      const pricePerNight = selectedBooking.roomId !== roomId 
        ? selectedRoom.price 
        : selectedBooking.pricePerNight ?? selectedRoom.price;

      const updatedBooking = { 
        ...selectedBooking, 
        clientName, 
        roomId,
        roomNumber: selectedRoom.roomNumber,
        checkIn, 
        checkOut, 
        status: status as BookingStatus,
        pricePerNight,
      };
      updateDocumentNonBlocking(doc(firestore, 'reservations', selectedBooking.id), updatedBooking);
      updateDocumentNonBlocking(roomRef, { status: newRoomStatus });
      toast({
        title: 'Reservation Updated',
        description: `Booking for ${clientName} has been updated.`,
      });
    }

    setDialogOpen(false);
  };

  const handleDelete = (booking: Booking) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'reservations', booking.id));
    const roomRef = doc(firestore, 'rooms', booking.roomId);
    updateDocumentNonBlocking(roomRef, { status: 'Available' });
    toast({
      title: 'Reservation Deleted',
      description: 'The booking has been removed.',
    });
  };

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(booking =>
      booking.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bookings, searchTerm]);


  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Reservation Management</h1>
      <p className="text-muted-foreground">Create, modify, and cancel reservations.</p>
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Reservations</CardTitle>
            <CardDescription>View and manage all guest reservations.</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by client name..."
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
                <TableHead>Client</TableHead>
                <TableHead>Room No.</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings?.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.clientName}</TableCell>
                  <TableCell>{booking.roomNumber}</TableCell>
                  <TableCell>{format(toDateSafe(booking.checkIn), 'MM/dd/yyyy')}</TableCell>
                  <TableCell>{format(toDateSafe(booking.checkOut), 'MM/dd/yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={bookingStatusVariant[booking.status]}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(booking)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(booking)}>
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
            <PlusCircle className="mr-2 h-4 w-4" /> Add Reservation
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Add New Reservation' : 'Edit Reservation'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' ? 'Fill in the details to add a new reservation.' : `Editing reservation for ${selectedBooking?.clientName}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">
                Client Name
              </Label>
              <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. John Doe" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roomNumber" className="text-right">
                Room
              </Label>
              <Select value={roomId} onValueChange={setRoomId}>
                  <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                      {rooms?.map(room => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.roomNumber} ({room.type})
                        </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="checkIn" className="text-right">
                Check-in
              </Label>
              <Input
                id="checkIn"
                type="date"
                value={checkIn ? format(checkIn, 'yyyy-MM-dd') : ''}
                onChange={(e) => setCheckIn(e.target.value ? parse(e.target.value, 'yyyy-MM-dd', new Date()) : undefined)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="checkOut" className="text-right">
                Check-out
              </Label>
              <Input
                id="checkOut"
                type="date"
                value={checkOut ? format(checkOut, 'yyyy-MM-dd') : ''}
                onChange={(e) => setCheckOut(e.target.value ? parse(e.target.value, 'yyyy-MM-dd', new Date()) : undefined)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
               <Select value={status} onValueChange={(value: BookingStatus) => setStatus(value)}>
                  <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Reserved">Reserved</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="CheckedIn">Checked-In</SelectItem>
                      <SelectItem value="CheckedOut">Checked-Out</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
              </Select>
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
