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
import type { Booking, BookingStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash, Calendar } from 'lucide-react';
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
import { format } from 'date-fns';
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useBookings } from '@/context/bookings-context';

const bookingStatusVariant: Record<BookingStatus, BadgeProps['variant']> = {
  'Confirmed': 'success',
  'Pending': 'warning',
  'Cancelled': 'destructive',
};

export default function ReservationsPage() {
  const { toast } = useToast();
  const { bookings, addBooking, updateBooking, deleteBooking } = useBookings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Form state
  const [clientName, setClientName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [status, setStatus] = useState<BookingStatus | ''>('');

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setSelectedBooking(null);
    setClientName('');
    setRoomNumber('');
    setCheckIn(undefined);
    setCheckOut(undefined);
    setStatus('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (booking: Booking) => {
    setDialogMode('edit');
    setSelectedBooking(booking);
    setClientName(booking.clientName);
    setRoomNumber(String(booking.roomNumber));
    setCheckIn(booking.checkIn);
    setCheckOut(booking.checkOut);
    setStatus(booking.status);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!clientName || !roomNumber || !checkIn || !checkOut || !status) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields.',
      });
      return;
    }
    
    const roomNumberValue = parseInt(roomNumber, 10);
    if (isNaN(roomNumberValue)) {
        toast({
            variant: 'destructive',
            title: 'Invalid Input',
            description: 'Room number must be a valid number.',
        });
        return;
    }

    if (dialogMode === 'add') {
      addBooking({
        clientName,
        roomNumber: roomNumberValue,
        checkIn,
        checkOut,
        status: status as BookingStatus,
      });
      toast({
        title: 'Reservation Added',
        description: `Booking for ${clientName} has been created.`,
      });
    } else if (dialogMode === 'edit' && selectedBooking) {
      updateBooking({ 
        ...selectedBooking, 
        clientName, 
        roomNumber: roomNumberValue, 
        checkIn, 
        checkOut, 
        status: status as BookingStatus 
      });
      toast({
        title: 'Reservation Updated',
        description: `Booking for ${clientName} has been updated.`,
      });
    }

    setDialogOpen(false);
  };

  const handleDelete = (bookingId: string) => {
    deleteBooking(bookingId);
    toast({
      title: 'Reservation Deleted',
      description: 'The booking has been removed.',
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Reservation Management</h1>
      <p className="text-muted-foreground">Create, modify, and cancel reservations.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Reservations</CardTitle>
          <CardDescription>View and manage all guest reservations.</CardDescription>
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
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.clientName}</TableCell>
                  <TableCell>{booking.roomNumber}</TableCell>
                  <TableCell>{format(booking.checkIn, 'MM/dd/yyyy')}</TableCell>
                  <TableCell>{format(booking.checkOut, 'MM/dd/yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={bookingStatusVariant[booking.status]}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(booking)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(booking.id)}>
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
                Room No.
              </Label>
              <Input id="roomNumber" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} type="number" placeholder="e.g. 101" className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="checkIn" className="text-right">
                Check-in
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarPicker
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="checkOut" className="text-right">
                Check-out
              </Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarPicker
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
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
