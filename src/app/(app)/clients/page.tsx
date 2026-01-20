import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ClientsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Client Management</h1>
      <p className="text-muted-foreground">Maintain client profiles, history, and preferences.</p>
        <Card className="mt-6">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Here you will manage your client database. Features will include viewing guest history, managing contact information, and noting guest preferences for personalized service.</p>
        </CardContent>
      </Card>
    </div>
  );
}
