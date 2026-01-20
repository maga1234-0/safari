import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Settings</h1>
      <p className="text-muted-foreground">Manage staff roles, permissions, and application settings.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The settings panel will allow administrators to manage user accounts, define roles (admin, reception, etc.), and configure application-wide settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
