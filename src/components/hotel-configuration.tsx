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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { hotelConfig as initialHotelConfig } from '@/lib/data';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function HotelConfiguration() {
  const { toast } = useToast();
  const [taxRate, setTaxRate] = useState(initialHotelConfig.taxRate);
  const [bookingPolicy, setBookingPolicy] = useState(initialHotelConfig.bookingPolicy);

  const handleSave = () => {
    // In a real app, this would persist to a database. For now, we show a toast.
    toast({
      title: 'Paramètres Sauvegardés',
      description: "Les paramètres de l'hôtel ont été mis à jour.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration de l'Hôtel</CardTitle>
        <CardDescription>Configurer les paramètres de l'hôtel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="taxRate">Taux de Taxe (%)</Label>
            <Input 
              id="taxRate" 
              type="number" 
              value={taxRate} 
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} 
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="bookingPolicy">Politique de Réservation</Label>
            <Textarea 
              id="bookingPolicy" 
              value={bookingPolicy} 
              onChange={(e) => setBookingPolicy(e.target.value)} 
              rows={5} 
            />
        </div>
      </CardContent>
       <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Sauvegarder les Paramètres
        </Button>
      </CardFooter>
    </Card>
  );
}
