'use client';

import { useState, useEffect } from 'react';
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
import { dashboardMetrics as initialMetrics, recentBookings, revenueData } from '@/lib/data';
import type { Booking, BookingStatus } from '@/lib/types';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { CircleDollarSign, Percent, CalendarPlus } from 'lucide-react';
import { format } from 'date-fns';

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const bookingStatusVariant: Record<BookingStatus, BadgeProps['variant']> = {
  'Confirmed': 'success',
  'Pending': 'warning',
  'Cancelled': 'destructive',
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [bookings, setBookings] = useState<Booking[]>(recentBookings);

  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setMetrics(prevMetrics => {
        const newBookingsToday = prevMetrics.newBookings + (Math.random() > 0.95 ? 1 : 0);
        return {
          totalRevenue: prevMetrics.totalRevenue + Math.random() * 50,
          occupancyRate: Math.max(0, Math.min(100, prevMetrics.occupancyRate + (Math.random() - 0.5))),
          newBookings: newBookingsToday,
        }
      });
    }, 2500);

    const bookingInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setBookings(prevBookings => {
            if (Math.random() > 0.5 && prevBookings.length > 0) {
                const bookingToUpdateIndex = Math.floor(Math.random() * prevBookings.length);
                const newBookings = [...prevBookings];
                const statusOptions: BookingStatus[] = ['Confirmed', 'Pending'];
                newBookings[bookingToUpdateIndex].status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
                return newBookings.sort((a, b) => b.checkIn.getTime() - a.checkIn.getTime());
            } else {
                 const newBooking: Booking = {
                    id: `BK${Math.floor(Math.random() * 1000) + 100}`,
                    clientName: ['Olivia Martinez', 'Liam Wilson', 'Emma Anderson', 'Noah Garcia'][Math.floor(Math.random() * 4)],
                    roomNumber: Math.floor(Math.random() * 200) + 100,
                    checkIn: new Date(),
                    checkOut: new Date(new Date().getTime() + (Math.floor(Math.random() * 5) + 1) * 24 * 60 * 60 * 1000),
                    status: 'Pending',
                 };
                return [newBooking, ...prevBookings.slice(0, 4)];
            }
        });
      }
    }, 4000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(bookingInterval);
    }
  }, []);

  return (
    <div className="grid flex-1 items-start gap-4 sm:gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Live data from booking system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Occupancy Rate
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              {metrics.occupancyRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Calculated in real-time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Bookings Today</CardTitle>
            <CalendarPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              +{metrics.newBookings}
            </div>
            <p className="text-xs text-muted-foreground">
              Live updates
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">Revenue Overview</CardTitle>
            <CardDescription>
              Revenue performance over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={revenueData}>
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
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">Recent Bookings</CardTitle>
            <CardDescription>
              A live-updating list of recent bookings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-medium">{booking.clientName}</div>
                    </TableCell>
                    <TableCell>{booking.roomNumber}</TableCell>
                    <TableCell>
                      {format(booking.checkIn, 'MM/dd/yyyy')} -{' '}
                      {format(booking.checkOut, 'MM/dd/yyyy')}
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
