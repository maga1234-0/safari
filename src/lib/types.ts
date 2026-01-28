import type { Timestamp } from 'firebase/firestore';

export type BookingStatus = 'Confirmée' | 'En attente' | 'Annulée' | 'Enregistré' | 'Parti' | 'Réservée';
export type PaymentStatus = 'En attente' | 'Payé' | 'Remboursé';

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
  paymentStatus?: PaymentStatus;
  totalAmount?: number;
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type RoomStatus = 'Disponible' | 'Occupée' | 'En maintenance';

export type Room = {
  id: string;
  roomNumber: number;
  type: 'Simple' | 'Double' | 'Suite';
  status: RoomStatus;
  price: number;
};

export type StaffRole = 'Admin' | 'Réception' | 'Entretien ménager';

export type StaffMember = {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: StaffRole;
};

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  preferences?: string;
  notes?: string;
};

export type HotelConfiguration = {
  id: string;
  taxRate: number;
  bookingPolicy: string;
};
