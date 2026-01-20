import type { Timestamp } from 'firebase/firestore';

export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'CheckedIn' | 'CheckedOut' | 'Reserved';

export type Booking = {
  id: string;
  clientId: string;
  clientName: string;
  roomId: string;
  roomNumber: number;
  checkIn: Date | Timestamp;
  checkOut: Date | Timestamp;
  status: BookingStatus;
  createdAt: Date | Timestamp;
  pricePerNight?: number;
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
