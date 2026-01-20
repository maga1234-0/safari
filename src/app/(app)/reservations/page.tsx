import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ReservationsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Reservation Management</h1>
      <p className="text-muted-foreground">Create, modify, and cancel reservations.</p>
        <Card className="mt-6">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The full reservation management system will be available here. You will be able to create new bookings, view a calendar of reservations, and manage existing appointments.</p>
        </CardContent>
      </Card>
    </div>
  );
}
