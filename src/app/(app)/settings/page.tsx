import { ThemeSettings } from "@/components/theme-settings";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Settings</h1>
      <p className="text-muted-foreground">Manage your application and account settings.</p>
      <div className="mt-6 grid gap-6">
        <ThemeSettings />

        <Card>
          <CardHeader>
            <CardTitle>Staff Management</CardTitle>
            <CardDescription>Manage staff roles and permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Coming soon: Add, edit, and remove staff members. Assign roles like Admin, Reception, and Housekeeping.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Hotel Configuration</CardTitle>
            <CardDescription>Configure hotel-wide settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Coming soon: Set tax rates, define booking policies, and manage other general hotel settings.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
