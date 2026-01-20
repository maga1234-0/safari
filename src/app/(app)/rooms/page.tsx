import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { rooms, roomStatusColors } from '@/lib/data';

export default function RoomsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Room Management</h1>
      <p className="text-muted-foreground">Track room availability, status, and details.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
          <CardDescription>View and manage all rooms in the hotel.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room No.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.roomNumber}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>
                    <Badge
                      className="text-white"
                      style={{
                        backgroundColor: roomStatusColors[room.status],
                      }}
                    >
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${room.price.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
