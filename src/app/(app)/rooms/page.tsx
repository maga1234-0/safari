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
  'Disponible': 'success',
  'Occupée': 'warning',
  'En maintenance': 'destructive',
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
      title: 'Chambre Supprimée',
      description: 'La chambre a été supprimée.',
    });
  };

  const handleSave = () => {
    if (!roomNumber || !type || !status || !price || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Informations Manquantes',
        description: 'Veuillez remplir tous les champs.',
      });
      return;
    }

    const priceValue = parseFloat(price);
    const roomNumberValue = parseInt(roomNumber, 10);

    if (isNaN(priceValue) || isNaN(roomNumberValue)) {
        toast({
            variant: 'destructive',
            title: 'Entrée Invalide',
            description: 'Le numéro de chambre et le prix doivent être des nombres valides.',
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
        title: 'Chambre Ajoutée',
        description: `La chambre ${roomNumberValue} a été ajoutée.`,
      });
    } else if (dialogMode === 'edit' && selectedRoom) {
      updateDocumentNonBlocking(doc(firestore, 'rooms', selectedRoom.id), roomData);
      toast({
        title: 'Chambre Mise à Jour',
        description: `Les informations de la chambre ${roomNumber} ont été mises à jour.`,
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
      <h1 className="text-3xl font-bold font-headline tracking-tight">Gestion des Chambres</h1>
      <p className="text-muted-foreground">Suivez la disponibilité, le statut et les détails des chambres.</p>
      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Toutes les Chambres</CardTitle>
            <CardDescription>Voir et gérer toutes les chambres de l'hôtel.</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par chambre ou type..."
              className="w-full appearance-none bg-background pl-8 shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="grid gap-4 md:hidden">
            {filteredRooms?.map((room, index) => (
              <Card
                key={room.id}
                className="animate-slide-in-from-bottom transition-shadow duration-300 hover:shadow-md"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                <CardHeader className="flex flex-row items-center justify-between p-4">
                  <div>
                    <CardTitle className="text-lg">Chambre {room.roomNumber}</CardTitle>
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
                    {room.status === 'Disponible' && (
                        <Button onClick={() => handleBookNow(room)} size="sm">Réserver maintenant</Button>
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
                  <TableHead>N° Chambre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Prix</TableHead>
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
                      {room.status === 'Disponible' && (
                          <Button onClick={() => handleBookNow(room)} size="sm" className="mr-2">Réserver maintenant</Button>
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
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Chambre
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Ajouter une Nouvelle Chambre' : 'Modifier la Chambre'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' ? "Remplissez les détails pour ajouter une nouvelle chambre." : `Modification des détails pour la chambre ${selectedRoom?.roomNumber}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roomNumber">
                N° Chambre
              </Label>
              <Input id="roomNumber" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} type="number" placeholder="e.g. 101" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">
                Type
              </Label>
               <Select value={type} onValueChange={(value: Room['type']) => setType(value)}>
                  <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Simple">Simple</SelectItem>
                      <SelectItem value="Double">Double</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">
                Statut
              </Label>
               <Select value={status} onValueChange={(value: RoomStatus) => setStatus(value)}>
                  <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Disponible">Disponible</SelectItem>
                      <SelectItem value="Occupée">Occupée</SelectItem>
                      <SelectItem value="En maintenance">En maintenance</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">
                Prix
              </Label>
              <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="e.g. 150" />
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
