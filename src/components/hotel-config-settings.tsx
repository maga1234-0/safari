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
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { HotelConfiguration } from '@/lib/types';
import { doc, setDoc } from 'firebase/firestore';

export function HotelConfigSettings() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const configDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'hotel-configuration', 'main_config');
  }, [firestore]);

  const { data: initialConfig, isLoading: isConfigLoading } = useDoc<HotelConfiguration>(configDocRef);

  const [taxRate, setTaxRate] = useState<string>('');
  const [bookingPolicy, setBookingPolicy] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (initialConfig && !isDataLoaded) {
      setTaxRate(String(initialConfig.taxRate || ''));
      setBookingPolicy(initialConfig.bookingPolicy || '');
      setIsDataLoaded(true);
    } else if (!initialConfig && !isConfigLoading && !isDataLoaded) {
      setIsDataLoaded(true); // Don't load anything, just mark as loaded
    }
  }, [initialConfig, isConfigLoading, isDataLoaded]);

  const handleSave = async () => {
    if (!firestore || !configDocRef) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'La connexion à la base de données a échoué.',
      });
      return;
    }

    setIsSaving(true);
    const rate = parseFloat(taxRate);

    // Allow empty string, but if not empty, it must be a valid number.
    if (taxRate.trim() !== '' && isNaN(rate)) {
      toast({
        variant: 'destructive',
        title: 'Taux de taxe invalide',
        description: 'Veuillez entrer un nombre valide pour le taux de taxe.',
      });
      setIsSaving(false);
      return;
    }

    const newConfigData = {
      taxRate: taxRate.trim() === '' ? 0 : rate,
      bookingPolicy,
    };
    
    try {
      await setDoc(configDocRef, newConfigData, { merge: true });
      toast({
        title: 'Configuration Enregistrée',
        description: 'Les paramètres de l\'hôtel ont été mis à jour.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Échec de la sauvegarde',
        description: 'Une erreur est survenue lors de l\'enregistrement.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isConfigLoading && !isDataLoaded) {
    return (
      <Card>
        <CardHeader>
           <CardTitle>Paramètres Généraux</CardTitle>
           <CardDescription>Définir les taux de taxe et les politiques de l'hôtel.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-40 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres Généraux</CardTitle>
        <CardDescription>Définir les taux de taxe et les politiques de l'hôtel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="taxRate">Taux de Taxe (%)</Label>
          <Input 
            id="taxRate" 
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            placeholder="e.g. 10" 
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bookingPolicy">Politique de Réservation</Label>
          <Textarea
            id="bookingPolicy"
            value={bookingPolicy}
            onChange={(e) => setBookingPolicy(e.target.value)}
            placeholder="Décrivez votre politique de réservation, d'annulation, etc."
            rows={5}
            disabled={isSaving}
          />
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? 'Enregistrement...' : 'Sauvegarder les Modifications'}
        </Button>
      </CardFooter>
    </Card>
  );
}
