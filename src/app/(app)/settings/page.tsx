import { StaffManagement } from "@/components/staff-management";
import { HotelConfiguration } from "@/components/hotel-configuration";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Settings</h1>
      <p className="text-muted-foreground">Manage your application and account settings.</p>
      <div className="mt-6 grid gap-6">
        <StaffManagement />
        <HotelConfiguration />
      </div>
    </div>
  );
}
