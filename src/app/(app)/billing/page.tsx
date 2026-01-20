import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Automated Billing</h1>
      <p className="text-muted-foreground">Generate invoices, process payments, and issue receipts.</p>
        <Card className="mt-6">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This module will handle all financial transactions. You'll be able to generate invoices automatically from bookings, track payment statuses, and issue receipts to clients.</p>
        </CardContent>
      </Card>
    </div>
  );
}
