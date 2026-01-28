'use client';

import { HotelConfigSettings } from "@/components/hotel-config-settings";

export default function HotelConfigPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Configuration de l'Hôtel</h1>
      <p className="text-muted-foreground">Gérez les paramètres globaux de l'hôtel.</p>
      <div className="mt-6 grid gap-6">
        <HotelConfigSettings />
      </div>
    </div>
  );
}
