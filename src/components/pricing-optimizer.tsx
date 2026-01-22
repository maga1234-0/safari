'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { differenceInDays } from 'date-fns';
import { optimizePricing, type OptimizePricingOutput } from '@/ai/flows/optimize-pricing';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Room, Booking } from '@/lib/types';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  roomId: z.string().min(1, { message: 'A room must be selected.' }),
  historicalData: z.string().min(10, { message: 'Please provide some historical data.' }),
  currentBookingTrends: z.string().min(10, { message: 'Please provide some current trends.' }),
});

function toDateSafe(date: any): Date {
  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  return new Date(date);
}

export function PricingOptimizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizePricingOutput | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const roomsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'rooms'));
  }, [firestore]);
  const { data: rooms } = useCollection<Room>(roomsQuery);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'reservations'));
  }, [firestore]);
  const { data: bookings } = useCollection<Booking>(bookingsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: '',
      historicalData: '',
      currentBookingTrends: '',
    },
  });

  const selectedRoomId = form.watch('roomId');

  useEffect(() => {
    if (selectedRoomId && rooms && bookings) {
      const room = rooms.find(r => r.id === selectedRoomId);
      if (!room) return;

      // Generate Historical Data
      const roomBookings = bookings.filter(b => b.roomId === selectedRoomId && ['Confirmed', 'CheckedIn', 'CheckedOut'].includes(b.status));
      let historicalDataText = `No historical booking data available for Room ${room.roomNumber}.`;
      
      if (roomBookings.length > 0) {
        let totalRevenue = 0;
        let totalNights = 0;

        roomBookings.forEach(booking => {
          const checkInDay = toDateSafe(booking.checkIn);
          const checkOutDay = toDateSafe(booking.checkOut);
          const nights = differenceInDays(checkOutDay, checkInDay);
          const nightsCount = nights > 0 ? nights : 1;
          totalNights += nightsCount;
          
          if (booking.totalAmount) {
             totalRevenue += booking.totalAmount;
          } else {
            const price = booking.pricePerNight ?? room.price;
            totalRevenue += price * nightsCount;
          }
        });
        
        const avgPrice = totalNights > 0 ? totalRevenue / totalNights : 0;

        historicalDataText = `Room ${room.roomNumber} (a ${room.type} type) has been booked ${roomBookings.length} time(s) with revenue-generating status. ` +
                             `The average price per night has been approximately $${avgPrice.toFixed(2)}. ` +
                             `The room's current base price is $${room.price.toFixed(2)}.`;
      }
      form.setValue('historicalData', historicalDataText, { shouldValidate: true });

      // Generate Current Trends
      const upcomingBookingsCount = bookings.filter(b => toDateSafe(b.checkIn) > new Date() && b.status !== 'Cancelled').length;
      const currentTrendsText = `The room is currently ${room.status}. The hotel has ${upcomingBookingsCount} upcoming reservations. `;
      form.setValue('currentBookingTrends', currentTrendsText + 'Consider competitor pricing, city-wide occupancy, and local events.', { shouldValidate: true });
    }
  }, [selectedRoomId, rooms, bookings, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const room = rooms?.find(r => r.id === values.roomId);
      if(!room) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Selected room not found.',
        });
        setIsLoading(false);
        return;
      }
      
      const aiResult = await optimizePricing({
        // Pass room number to AI instead of ID for better understanding
        roomId: `Room ${room.roomNumber}`, 
        historicalData: values.historicalData,
        currentBookingTrends: values.currentBookingTrends
      });
      setResult(aiResult);
    } catch (error) {
      console.error('Error optimizing pricing:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get pricing suggestion from AI.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Bot/> AI Pricing Input</CardTitle>
              <CardDescription>Select a room to automatically generate data, then get an optimized price suggestion.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room to analyze" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms?.map(room => (
                          <SelectItem key={room.id} value={room.id}>
                            Room {room.roomNumber} ({room.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="historicalData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Select a room to auto-generate historical data..."
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                       This data is automatically generated. You can edit it before sending to the AI.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentBookingTrends"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Booking Trends & Context</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Select a room to auto-generate trend data. Add any other relevant info like competitor pricing or local events."
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This data is partially generated. Add more context for a better suggestion.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading || !selectedRoomId} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  'Get Suggestion'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Sparkles className="text-accent"/> AI Suggestion</CardTitle>
          <CardDescription>The AI's recommended price based on your input.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>AI is thinking...</p>
            </div>
          ) : result ? (
            <div className="space-y-4 text-sm">
                <div className="text-center">
                    <p className="text-muted-foreground">Suggested Price</p>
                    <p className="text-4xl font-bold text-primary font-headline md:text-5xl">${result.suggestedPrice.toFixed(2)}</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Reasoning:</h4>
                    <p className="text-muted-foreground bg-secondary/50 p-4 rounded-lg border">{result.reasoning}</p>
                </div>
            </div>
          ) : (
             <div className="text-center text-muted-foreground">
                <p>Select a room to get a pricing suggestion.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
