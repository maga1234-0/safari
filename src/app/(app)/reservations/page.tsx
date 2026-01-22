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
import type { Booking, BookingStatus, PaymentStatus, Room } from '@/lib/types';
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
import { format, toDate, parse, differenceInDays } from 'date-fns';
import { useCollection, useFirestore, useUser, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, serverTimestamp } from 'firebase/firestore';

const bookingStatusVariant: Record<BookingStatus, BadgeProps['variant']> = {
  'Confirmée': 'success',
  'En attente': 'warning',
  'Annulée': 'destructive',
  'Enregistré': 'default',
  'Parti': 'secondary',
  'Réservée': 'default',
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
  const { data: rooms } = useCollection<Room>(roomsQuery);

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
        setStatus('En attente');
        setDialogOpen(true);
        setPrefilled(true);
      }
    }
  }, [searchParams, rooms, prefilled]);

  const availableRoomsForBooking = useMemo(() => {
    if (!rooms) return [];
    return rooms.filter(room => {
      if (room.status === 'Disponible') {
        return true;
      }
      if (dialogMode === 'edit' && selectedBooking && room.id === selectedBooking.roomId) {
        return true;
      }
      return false;
    });
  }, [rooms, dialogMode, selectedBooking]);

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
        title: 'Informations Manquantes',
        description: 'Veuillez remplir tous les champs.',
      });
      return;
    }
    
    const selectedRoom = rooms?.find(r => r.id === roomId);
    if (!selectedRoom) {
        toast({
            variant: 'destructive',
            title: 'Chambre Invalide',
            description: "La chambre sélectionnée n'existe pas.",
        });
        return;
    }

    const roomRef = doc(firestore, 'rooms', roomId);
    const newRoomStatus = status === 'Annulée' || status === 'Parti' ? 'Disponible' : 'Occupée';

    const nights = differenceInDays(checkOut, checkIn);
    const nightsCount = nights > 0 ? nights : 1;

    const statusesThatImplyPaid: BookingStatus[] = ['Confirmée', 'Enregistré', 'Parti'];

    if (dialogMode === 'add') {
      const totalAmount = selectedRoom.price * nightsCount;
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
        paymentStatus: statusesThatImplyPaid.includes(status as BookingStatus) ? 'Payé' : 'En attente',
        totalAmount,
      };
      addDocumentNonBlocking(collection(firestore, 'reservations'), newBooking);
      updateDocumentNonBlocking(roomRef, { status: newRoomStatus });
      toast({
        title: 'Réservation Ajoutée',
        description: `La réservation pour ${clientName} a été créée.`,
      });
    } else if (dialogMode === 'edit' && selectedBooking) {
      if (selectedBooking.roomId !== roomId) {
        const oldRoomRef = doc(firestore, 'rooms', selectedBooking.roomId);
        updateDocumentNonBlocking(oldRoomRef, { status: 'Disponible' });
      }
      
      const pricePerNight = selectedBooking.roomId !== roomId 
        ? selectedRoom.price 
        : selectedBooking.pricePerNight ?? selectedRoom.price;

      const totalAmount = pricePerNight * nightsCount;

      let newPaymentStatus: PaymentStatus = selectedBooking.paymentStatus || 'En attente';
      if (statusesThatImplyPaid.includes(status as BookingStatus)) {
        newPaymentStatus = 'Payé';
      } else if (status === 'Annulée') {
        if (selectedBooking.paymentStatus === 'Payé') {
            newPaymentStatus = 'Remboursé';
        } else {
            newPaymentStatus = 'En attente';
        }
      } else {
        newPaymentStatus = 'En attente';
      }

      const updatedBooking = { 
        ...selectedBooking, 
        clientName, 
        roomId,
        roomNumber: selectedRoom.roomNumber,
        checkIn, 
        checkOut, 
        status: status as BookingStatus,
        pricePerNight,
        totalAmount,
        paymentStatus: newPaymentStatus,
      };
      updateDocumentNonBlocking(doc(firestore, 'reservations', selectedBooking.id), updatedBooking);
      updateDocumentNonBlocking(roomRef, { status: newRoomStatus });
      toast({
        title: 'Réservation Mise à Jour',
        description: `La réservation pour ${clientName} a été mise à jour.`,
      });
    }

    setDialogOpen(false);
  };

  const handleDelete = (booking: Booking) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'reservations', booking.id));
    const roomRef = doc(firestore, 'rooms', booking.roomId);
    updateDocumentNonBlocking(roomRef, { status: 'Disponible' });
    toast({
      title: 'Réservation Supprimée',
      description: 'La réservation a été supprimée.',
    });
  };

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(booking =>
      booking.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bookings, searchTerm]);

  const calculateTotal = (booking: Booking) => {
    if (booking.totalAmount) {
      return booking.totalAmount;
    }
    if (booking.pricePerNight && booking.checkIn && booking.checkOut) {
      const checkInDay = toDateSafe(booking.checkIn);
      const checkOutDay = toDateSafe(booking.checkOut);
      const nights = differenceInDays(checkOutDay, checkInDay);
      const nightsCount = nights > 0 ? nights : 1;
      return booking.pricePerNight * nightsCount;
    }
    return 0;
  }


  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Gestion des Réservations</h1>
      <p className="text-muted-foreground">Créez, modifiez et annulez des réservations.</p>
      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Toutes les réservations</CardTitle>
            <CardDescription>Voir et gérer toutes les réservations des clients.</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par nom de client..."
              className="w-full appearance-none bg-background pl-8 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile view */}
          <div className="grid gap-4 md:hidden">
            {filteredBookings?.map((booking, index) => (
            <Card
              key={booking.id}
              className="animate-slide-in-from-bottom transition-shadow duration-300 hover:shadow-lg"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
                <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg">{booking.clientName}</CardTitle>
                            <CardDescription>Chambre {booking.roomNumber}</CardDescription>
                        </div>
                        <Badge variant={bookingStatusVariant[booking.status]}>
                            {booking.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                    <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Arrivée: </span>
                        {format(toDateSafe(booking.checkIn), 'EEE, d MMM, yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Départ: </span>
                        {format(toDateSafe(booking.checkOut), 'EEE, d MMM, yyyy')}
                    </div>
                    <div className="text-lg font-bold text-right">
                        ${calculateTotal(booking).toFixed(2)}
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(booking)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(booking)}>
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
                  <TableHead>Client</TableHead>
                  <TableHead>N° Chambre</TableHead>
                  <TableHead>Arrivée</TableHead>
                  <TableHead>Départ</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings?.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.clientName}</TableCell>
                    <TableCell>{booking.roomNumber}</TableCell>
                    <TableCell>{format(toDateSafe(booking.checkIn), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(toDateSafe(booking.checkOut), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={bookingStatusVariant[booking.status]}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${calculateTotal(booking).toFixed(2)}</TableCell>
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
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une réservation
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Ajouter une Nouvelle Réservation' : 'Modifier la Réservation'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' ? "Remplissez les détails pour ajouter une nouvelle réservation." : `Modification de la réservation pour ${selectedBooking?.clientName}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clientName">
                Nom du Client
              </Label>
              <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roomNumber">
                Chambre
              </Label>
              <Select value={roomId} onValueChange={setRoomId}>
                  <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une chambre" />
                  </SelectTrigger>
                  <SelectContent>
                      {availableRoomsForBooking?.map(room => (
                        <SelectItem key={room.id} value={room.id}>
                          Chambre {room.roomNumber} ({room.type})
                        </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="checkIn">
                Arrivée
              </Label>
              <Input
                id="checkIn"
                type="date"
                value={checkIn ? format(checkIn, 'yyyy-MM-dd') : ''}
                onChange={(e) => setCheckIn(e.target.value ? parse(e.target.value, 'yyyy-MM-dd', new Date()) : undefined)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="checkOut">
                Départ
              </Label>
              <Input
                id="checkOut"
                type="date"
                value={checkOut ? format(checkOut, 'yyyy-MM-dd') : ''}
                onChange={(e) => setCheckOut(e.target.value ? parse(e.target.value, 'yyyy-MM-dd', new Date()) : undefined)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">
                Statut
              </Label>
               <Select value={status} onValueChange={(value: BookingStatus) => setStatus(value)}>
                  <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="En attente">En attente</SelectItem>
                      <SelectItem value="Réservée">Réservée</SelectItem>
                      <SelectItem value="Confirmée">Confirmée</SelectItem>
                      <SelectItem value="Enregistré">Enregistré</SelectItem>
                      <SelectItem value="Parti">Parti</SelectItem>
                      <SelectItem value="Annulée">Annulée</SelectItem>
                  </SelectContent>
              </Select>
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
