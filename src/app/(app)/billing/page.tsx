'use client';

import { useState, useMemo } from 'react';
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
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuCheckboxItem 
} from '@/components/ui/dropdown-menu';
import { ListFilter, Search } from 'lucide-react';
import type { Booking, PaymentStatus } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, query } from 'firebase/firestore';
import { format, toDate, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const paymentStatusVariant: Record<PaymentStatus, BadgeProps['variant']> = {
  'Paid': 'success',
  'Pending': 'warning',
  'Refunded': 'destructive',
};

function toDateSafe(date: any): Date {
  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  return toDate(date);
}

export default function BillingPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const reservationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'reservations'));
  }, [firestore]);
  const { data: reservations } = useCollection<Booking>(reservationsQuery);
  
  const [statusFilter, setStatusFilter] = useState<PaymentStatus[]>(['Pending', 'Paid', 'Refunded']);
  const [searchTerm, setSearchTerm] = useState('');

  const handleMarkAsPaid = (bookingId: string) => {
    if (!firestore) return;
    const bookingRef = doc(firestore, 'reservations', bookingId);
    updateDocumentNonBlocking(bookingRef, { paymentStatus: 'Paid' });
    toast({
        title: 'Payment Status Updated',
        description: 'The reservation has been marked as paid.',
    });
  };

  const handleRefund = (bookingId: string) => {
    if (!firestore) return;
    const bookingRef = doc(firestore, 'reservations', bookingId);
    updateDocumentNonBlocking(bookingRef, { paymentStatus: 'Refunded' });
    toast({
        variant: 'destructive',
        title: 'Payment Refunded',
        description: 'The reservation has been marked as refunded.',
    });
  };

  const filteredReservations = useMemo(() => {
    if (!reservations) return [];
    return reservations
      .filter(reservation => statusFilter.includes(reservation.paymentStatus || 'Pending'))
      .filter(reservation => reservation.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [reservations, statusFilter, searchTerm]);
  
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
      <h1 className="text-3xl font-bold font-headline tracking-tight">Automated Billing</h1>
      <p className="text-muted-foreground">Generate invoices, process payments, and issue receipts.</p>
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>View and manage all financial transactions.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filter
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by payment status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes('Pending')}
                    onCheckedChange={(checked) => {
                      setStatusFilter(current => checked ? [...current, 'Pending'] : current.filter(s => s !== 'Pending'));
                    }}
                  >
                    Pending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes('Paid')}
                    onCheckedChange={(checked) => {
                      setStatusFilter(current => checked ? [...current, 'Paid'] : current.filter(s => s !== 'Paid'));
                    }}
                  >
                    Paid
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes('Refunded')}
                    onCheckedChange={(checked) => {
                      setStatusFilter(current => checked ? [...current, 'Refunded'] : current.filter(s => s !== 'Refunded'));
                    }}
                  >
                    Refunded
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations?.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id.substring(0,7).toUpperCase()}</TableCell>
                  <TableCell>{booking.clientName}</TableCell>
                  <TableCell>
                    {format(toDateSafe(booking.checkIn), 'MM/dd/yyyy')} -{' '}
                    {format(toDateSafe(booking.checkOut), 'MM/dd/yyyy')}
                  </TableCell>
                  <TableCell>${calculateTotal(booking).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={paymentStatusVariant[booking.paymentStatus || 'Pending']}>
                      {booking.paymentStatus || 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {booking.paymentStatus === 'Pending' && (
                        <Button size="sm" onClick={() => handleMarkAsPaid(booking.id)}>Mark as Paid</Button>
                    )}
                    {booking.paymentStatus === 'Paid' && (
                        <Button variant="outline" size="sm" onClick={() => handleRefund(booking.id)}>Issue Refund</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
