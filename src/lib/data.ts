import type { Booking, Revenue, Room, BookingStatus, RoomStatus, StaffMember, HotelConfig } from './types';

export const dashboardMetrics = {
  occupancyRate: 75.5,
  totalRevenue: 42530.75,
  newBookings: 12,
};

export const revenueData: Revenue[] = [
  { month: "Jan", revenue: 32000 },
  { month: "Feb", revenue: 28000 },
  { month: "Mar", revenue: 45000 },
  { month: "Apr", revenue: 42000 },
  { month: "May", revenue: 58000 },
  { month: "Jun", revenue: 62000 },
];

export const recentBookings: Booking[] = [
  { id: 'BK001', clientName: 'Amina Diallo', roomNumber: 101, checkIn: new Date('2024-08-10'), checkOut: new Date('2024-08-15'), status: 'Confirmed' },
  { id: 'BK002', clientName: 'Kwame Nkrumah', roomNumber: 205, checkIn: new Date('2024-08-11'), checkOut: new Date('2024-08-13'), status: 'Confirmed' },
  { id: 'BK003', clientName: 'Fatoumata Keita', roomNumber: 302, checkIn: new Date('2024-08-12'), checkOut: new Date('2024-08-18'), status: 'Pending' },
  { id: 'BK004', clientName: 'David Adewale', roomNumber: 108, checkIn: new Date('2024-08-14'), checkOut: new Date('2024-08-16'), status: 'Confirmed' },
  { id: 'BK005', clientName: 'Chidinma Okoro', roomNumber: 210, checkIn: new Date('2024-08-15'), checkOut: new Date('2024-08-20'), status: 'Cancelled' },
];

export const rooms: Room[] = [
    { id: 'R101', roomNumber: 101, type: 'Single', status: 'Available', price: 120 },
    { id: 'R102', roomNumber: 102, type: 'Double', status: 'Occupied', price: 180 },
    { id: 'R103', roomNumber: 103, type: 'Single', status: 'Available', price: 125 },
    { id: 'R104', roomNumber: 104, type: 'Suite', status: 'Maintenance', price: 350 },
    { id: 'R201', roomNumber: 201, type: 'Double', status: 'Available', price: 190 },
    { id: 'R202', roomNumber: 202, type: 'Suite', status: 'Occupied', price: 400 },
    { id: 'R203', roomNumber: 203, type: 'Double', status: 'Available', price: 195 },
    { id: 'R301', roomNumber: 301, type: 'Single', status: 'Maintenance', price: 110 },
];

export const staffMembers: StaffMember[] = [
  { id: 'S001', name: 'John Doe', email: 'john.doe@safarihotel.com', role: 'Admin' },
  { id: 'S002', name: 'Jane Smith', email: 'jane.smith@safarihotel.com', role: 'Reception' },
  { id: 'S003', name: 'Peter Jones', email: 'peter.jones@safarihotel.com', role: 'Housekeeping' },
  { id: 'S004', name: 'Mary Williams', email: 'mary.williams@safarihotel.com', role: 'Reception' },
];

export const hotelConfig: HotelConfig = {
    taxRate: 12.5,
    bookingPolicy: 'Cancellations made within 48 hours of check-in will incur a fee equivalent to one night\'s stay. No-shows will be charged the full amount of the reservation.'
};
