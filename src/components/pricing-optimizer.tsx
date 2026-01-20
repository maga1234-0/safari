'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { optimizePricing, type OptimizePricingOutput } from '@/ai/flows/optimize-pricing';

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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2, Sparkles } from 'lucide-radix';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  roomId: z.string().min(1, { message: 'Room ID is required.' }),
  historicalData: z.string().min(10, { message: 'Please provide some historical data.' }),
  currentBookingTrends: z.string().min(10, { message: 'Please provide some current trends.' }),
});

export function PricingOptimizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizePricingOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: 'Deluxe-101',
      historicalData: 'Last 6 months: Occupancy 85% at $150/night during peak season (Jun-Aug), 60% at $120/night off-peak. Weekends are 20% more popular.',
      currentBookingTrends: 'Upcoming holiday weekend shows 95% city-wide hotel occupancy. Competitor hotels are priced at $180-$220. A large conference is scheduled in town next month.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const aiResult = await optimizePricing(values);
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
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Bot/> AI Pricing Input</CardTitle>
              <CardDescription>Provide data to get an optimized price suggestion.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Deluxe-101" {...field} />
                    </FormControl>
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
                        placeholder="e.g., Occupancy rates, past prices..."
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                       Provide past booking data, including prices and occupancy.
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
                    <FormLabel>Current Booking Trends</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Demand, competitor pricing, events..."
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include current demand, competitor prices, and local events.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
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
                    <p className="text-5xl font-bold text-primary font-headline">${result.suggestedPrice.toFixed(2)}</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Reasoning:</h4>
                    <p className="text-muted-foreground bg-secondary/50 p-4 rounded-lg border">{result.reasoning}</p>
                </div>
            </div>
          ) : (
             <div className="text-center text-muted-foreground">
                <p>Your pricing suggestion will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
