'use client';

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
import { hotelConfig } from '@/lib/data';
import { Save } from 'lucide-react';

export function HotelConfiguration() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration de l'Hôtel</CardTitle>
        <CardDescription>Configurer les paramètres de l'hôtel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="taxRate">Taux de Taxe (%)</Label>
            <Input id="taxRate" type="number" defaultValue={hotelConfig.taxRate} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="bookingPolicy">Politique de Réservation</Label>
            <Textarea id="bookingPolicy" defaultValue={hotelConfig.bookingPolicy} rows={5} />
        </div>
      </CardContent>
       <CardFooter className="border-t px-6 py-4">
        <Button>
          <Save className="mr-2 h-4 w-4" /> Sauvegarder les Paramètres
        </Button>
      </CardFooter>
    </Card>
  );
}
