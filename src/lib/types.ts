export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

export type Booking = {
  id: string;
  clientName: string;
  roomNumber: number;
  checkIn: Date;
  checkOut: Date;
  status: BookingStatus;
  createdAt: Date;
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance';

export type Room = {
  id: string;
  roomNumber: number;
  type: 'Single' | 'Double' | 'Suite';
  status: RoomStatus;
  price: number;
};

export type StaffRole = 'Admin' | 'Reception' | 'Housekeeping';

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
};

export type HotelConfig = {
  taxRate: number;
  bookingPolicy: string;
};
