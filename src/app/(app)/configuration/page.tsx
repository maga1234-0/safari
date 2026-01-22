import { HotelConfiguration } from "@/components/hotel-configuration";

export default function ConfigurationPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Configuration de l'Hôtel</h1>
      <p className="text-muted-foreground">Configurer les paramètres de l'hôtel.</p>
      <div className="mt-6">
        <HotelConfiguration />
      </div>
    </div>
  );
}
