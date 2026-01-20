export type Booking = {
  id: string;
  clientName: string;
  roomNumber: number;
  checkIn: Date;
  checkOut: Date;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
};

export type Revenue = {
  month: string;
  revenue: number;
};
