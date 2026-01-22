'use client';

import { useState, useEffect } from 'react';
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
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { HotelConfig } from '@/lib/types';
import { hotelConfig as initialHotelConfig } from '@/lib/data';

const CONFIG_DOC_ID = 'main';

export function HotelConfiguration() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const configDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'configuration', CONFIG_DOC_ID);
  }, [firestore]);

  const { data: configData, isLoading } = useDoc<HotelConfig>(configDocRef);

  const [taxRate, setTaxRate] = useState(initialHotelConfig.taxRate);
  const [bookingPolicy, setBookingPolicy] = useState(initialHotelConfig.bookingPolicy);

  useEffect(() => {
    if (configData) {
      setTaxRate(configData.taxRate);
      setBookingPolicy(configData.bookingPolicy);
    }
  }, [configData]);

  const handleSave = () => {
    if (!firestore || !configDocRef) return;
    
    const newConfig = {
        taxRate,
        bookingPolicy
    };

    setDocumentNonBlocking(configDocRef, newConfig, { merge: true });
    
    toast({
      title: 'Paramètres Sauvegardés',
      description: "Les paramètres de l'hôtel ont été mis à jour.",
    });
  };
  
  if (isLoading) {
      return (
          <Card>
              <CardHeader>
                <CardTitle>Configuration de l'Hôtel</CardTitle>
                <CardDescription>Chargement des paramètres...</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center p-10">
                  <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
          </Card>
      );
  }

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
