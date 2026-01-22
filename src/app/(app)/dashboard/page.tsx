'use client';

import { useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { Booking, BookingStatus, Room } from '@/lib/types';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import {
  CircleDollarSign,
  CalendarPlus,
  Loader2,
  Bed,
  BedDouble,
  Wrench,
  Building,
} from 'lucide-react';
import { format, differenceInDays, isToday, startOfDay, toDate, getYear, startOfYear, endOfYear } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { useNotifications } from '@/context/notification-context';

const chartConfig = {
  revenue: {
    label: 'Revenu',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

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

export default function Dashboard() {
  const firestore = useFirestore();
  const { addNotification } = useNotifications();
  
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'reservations'));
  }, [firestore]);
  const { data: bookings, isLoading: bookingsLoading } = useCollection<Booking>(bookingsQuery);

  const roomsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'rooms'));
  }, [firestore]);
  const { data: rooms, isLoading: roomsLoading } = useCollection<Room>(roomsQuery);

  useEffect(() => {
    if (!bookings || !firestore) return;

    const today = startOfDay(new Date());

    bookings.forEach(booking => {
      const checkOutDate = startOfDay(toDateSafe(booking.checkOut));
      // Only act on bookings that are 'CheckedIn' or 'Confirmed' and due for checkout
      if ((booking.status === 'Enregistré' || booking.status === 'Confirmée') && today >= checkOutDate) {
        
        const bookingRef = doc(firestore, 'reservations', booking.id);
        updateDocumentNonBlocking(bookingRef, { status: 'Parti', paymentStatus: 'Payé' });

        const roomRef = doc(firestore, 'rooms', booking.roomId);
        updateDocumentNonBlocking(roomRef, { status: 'Disponible' });

        addNotification(
          `Chambre ${booking.roomNumber} check-out automatique terminé.`,
          `/rooms`
        );
      }
    });
  }, [bookings, firestore, addNotification]);

  const metrics = useMemo(() => {
    if (!bookings || !rooms) {
      return { totalRevenue: 0, newBookings: 0, availableRooms: 0, occupiedRooms: 0, maintenanceRooms: 0, totalRooms: 0 };
    }

    const revenueBookings = bookings.filter(b => 
        ['Confirmée', 'Enregistré', 'Parti'].includes(b.status)
    );

    const totalRevenue = revenueBookings.reduce((acc, booking) => {
      const checkInDay = startOfDay(toDateSafe(booking.checkIn));
      const checkOutDay = startOfDay(toDateSafe(booking.checkOut));
      const nights = differenceInDays(checkOutDay, checkInDay);
      const nightsCount = nights > 0 ? nights : 1;

      // Prioritize price from booking, fallback to room price
      const price = booking.pricePerNight ?? rooms.find(r => r.id === booking.roomId)?.price ?? 0;

      return acc + (price * nightsCount);
    }, 0);
    
    const newBookings = bookings.filter(b => isToday(toDateSafe(b.createdAt))).length;

    const availableRooms = rooms.filter(r => r.status === 'Disponible').length;
    const occupiedRooms = rooms.filter(r => r.status === 'Occupée').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'En maintenance').length;
    const totalRooms = rooms.length;

    return {
      totalRevenue,
      newBookings,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      totalRooms,
    };
  }, [bookings, rooms]);

  const recentBookings = useMemo(() => {
    if (!bookings) return [];
    return [...bookings]
        .sort((a, b) => toDateSafe(b.createdAt).getTime() - toDateSafe(a.createdAt).getTime())
        .slice(0, 5);
  }, [bookings]);

  const monthlyRevenueData = useMemo(() => {
    if (!bookings || !rooms) {
      return [];
    }

    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());

    const monthLabels = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
      'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];
    
    const monthlyTotals = monthLabels.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {} as Record<string, number>);

    const revenueBookings = bookings.filter(b => {
        const checkInDate = toDateSafe(b.checkIn);
        const isCurrentYear = checkInDate >= yearStart && checkInDate <= yearEnd;
        const isRevenueStatus = ['Confirmée', 'Enregistré', 'Parti'].includes(b.status);
        return isCurrentYear && isRevenueStatus;
    });

    revenueBookings.forEach(booking => {
      const checkInDate = toDateSafe(booking.checkIn);
      const month = format(checkInDate, 'MMM');
      const checkInDay = startOfDay(toDateSafe(booking.checkIn));
      const checkOutDay = startOfDay(toDateSafe(booking.checkOut));
      const nights = differenceInDays(checkOutDay, checkInDay);
      const nightsCount = nights > 0 ? nights : 1;
      const price = booking.pricePerNight ?? rooms.find(r => r.id === booking.roomId)?.price ?? 0;
      const bookingRevenue = price * nightsCount;
      
      const monthLabel = monthLabels[checkInDate.getMonth()];
      if (monthlyTotals.hasOwnProperty(monthLabel)) {
        monthlyTotals[monthLabel] += bookingRevenue;
      }
    });

    return monthLabels.map(month => ({
      month,
      revenue: monthlyTotals[month],
    }));
  }, [bookings, rooms]);

  if (bookingsLoading || roomsLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="grid flex-1 items-start gap-4 sm:gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="animate-slide-in-from-top shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenu Total
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              ${metrics.totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Des réservations confirmées, enregistrées et parties
            </p>
          </CardContent>
        </Card>
        <Card className="animate-slide-in-from-top shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chambres Disponibles</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{metrics.availableRooms}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalRooms > 0 ? `${((metrics.availableRooms / metrics.totalRooms) * 100).toFixed(0)}% du total des chambres` : 'Pas de chambres disponibles'}
            </p>
          </CardContent>
        </Card>
        <Card className="animate-slide-in-from-top shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chambres Occupées</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{metrics.occupiedRooms}</div>
            <p className="text-xs text-muted-foreground">
               {metrics.totalRooms > 0 ? `${((metrics.occupiedRooms / metrics.totalRooms) * 100).toFixed(0)}% du total des chambres` : 'Pas de chambres disponibles'}
            </p>
          </CardContent>
        </Card>
        <Card className="animate-slide-in-from-top shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{metrics.maintenanceRooms}</div>
            <p className="text-xs text-muted-foreground">
              Chambres actuellement indisponibles
            </p>
          </CardContent>
        </Card>
        <Card className="animate-slide-in-from-top shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouvelles Réservations Aujourd'hui</CardTitle>
            <CalendarPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              +{metrics.newBookings}
            </div>
            <p className="text-xs text-muted-foreground">
              Basé sur la date de création
            </p>
          </CardContent>
        </Card>
        <Card className="animate-slide-in-from-top shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: '500ms', animationFillMode: 'backwards' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des Chambres</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{metrics.totalRooms}</div>
            <p className="text-xs text-muted-foreground">Capacité totale de l'hôtel</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card className="lg:col-span-1 animate-slide-in-from-bottom transition-shadow duration-300 hover:shadow-lg" style={{ animationDelay: '600ms', animationFillMode: 'backwards' }}>
          <CardHeader>
            <CardTitle className="font-headline">Aperçu des Revenus</CardTitle>
            <CardDescription>
              Performance des revenus pour l'année en cours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={monthlyRevenueData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                    tickFormatter={(value) => `$${Number(value) / 1000}k`}
                    />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1 animate-slide-in-from-bottom transition-shadow duration-300 hover:shadow-lg" style={{ animationDelay: '700ms', animationFillMode: 'backwards' }}>
          <CardHeader>
            <CardTitle className="font-headline">Réservations Récentes</CardTitle>
            <CardDescription>
              Une liste des réservations récentes mise à jour en direct.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Chambre</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking, index) => (
                  <TableRow key={booking.id} className="animate-slide-in-from-bottom" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>
                    <TableCell>
                      <div className="font-medium">{booking.clientName}</div>
                    </TableCell>
                    <TableCell>{booking.roomNumber}</TableCell>
                    <TableCell>
                      {format(toDateSafe(booking.checkIn), 'dd/MM/yyyy')} -{' '}
                      {format(toDateSafe(booking.checkOut), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                       <Badge variant={bookingStatusVariant[booking.status]}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
