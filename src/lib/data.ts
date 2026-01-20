import type { Booking, Revenue } from './types';

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

export const bookingStatusColors = {
  'Confirmed': 'bg-green-500',
  'Pending': 'bg-yellow-500',
  'Cancelled': 'bg-red-500',
};
