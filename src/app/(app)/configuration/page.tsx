import { HotelConfiguration } from "@/components/hotel-configuration";

export default function ConfigurationPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Hotel Configuration</h1>
      <p className="text-muted-foreground">Configure hotel-wide settings.</p>
      <div className="mt-6">
        <HotelConfiguration />
      </div>
    </div>
  );
}
