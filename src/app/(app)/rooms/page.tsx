import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RoomsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Room Management</h1>
      <p className="text-muted-foreground">Track room availability, status, and details.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The full room management interface will be available here, allowing you to view and update room statuses (available, occupied, maintenance), manage room types, and set pricing.</p>
        </CardContent>
      </Card>
    </div>
  );
}
