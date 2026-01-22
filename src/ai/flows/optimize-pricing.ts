// OptimizePricingWithAI
'use server';

/**
 * @fileOverview An AI agent that suggests optimized room pricing based on historical data and current booking trends.
 *
 * - optimizePricing - A function that suggests optimized room pricing.
 * - OptimizePricingInput - The input type for the optimizePricing function.
 * - OptimizePricingOutput - The return type for the optimizePricing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizePricingInputSchema = z.object({
  roomId: z.string().describe('The name or number of the room to optimize pricing for (e.g., "Room 101").'),
  historicalData: z.string().describe('Historical booking data for the room, including dates, prices, and occupancy rates.'),
  currentBookingTrends: z.string().describe('Current booking trends, including demand, competitor pricing, and seasonal factors.'),
});
export type OptimizePricingInput = z.infer<typeof OptimizePricingInputSchema>;

const OptimizePricingOutputSchema = z.object({
  suggestedPrice: z.number().describe('The suggested optimized price for the room.'),
  reasoning: z.string().describe('The reasoning behind the suggested price, including factors considered.'),
});
export type OptimizePricingOutput = z.infer<typeof OptimizePricingOutputSchema>;

export async function optimizePricing(input: OptimizePricingInput): Promise<OptimizePricingOutput> {
  return optimizePricingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizePricingPrompt',
  input: {schema: OptimizePricingInputSchema},
  output: {schema: OptimizePricingOutputSchema},
  prompt: `You are an AI-powered pricing optimization expert for hotels.

You are provided with information about a specific room, its historical booking data, and current booking trends.

Room for optimization: {{{roomId}}}

Based on all this information, you will suggest an optimized price for the room to maximize revenue.

Historical Data: {{{historicalData}}}
Current Booking Trends: {{{currentBookingTrends}}}

Consider factors such as demand, competitor pricing, seasonal trends, and occupancy rates.

Provide a suggested price and the reasoning behind it.
`,
});

const optimizePricingFlow = ai.defineFlow(
  {
    name: 'optimizePricingFlow',
    inputSchema: OptimizePricingInputSchema,
    outputSchema: OptimizePricingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
