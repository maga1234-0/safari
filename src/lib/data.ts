import type { Revenue, HotelConfig } from './types';

export const dashboardMetrics = {
  occupancyRate: 73.8,
  totalRevenue: 42791.92,
  newBookings: 13,
};

export const revenueData: Revenue[] = [
  { month: "Jan", revenue: 32000 },
  { month: "Feb", revenue: 28000 },
  { month: "Mar", revenue: 45000 },
  { month: "Apr", revenue: 42000 },
  { month: "May", revenue: 58000 },
  { month: "Jun", revenue: 62000 },
];

export const hotelConfig: HotelConfig = {
    taxRate: 12.5,
    bookingPolicy: 'Cancellations made within 48 hours of check-in will incur a fee equivalent to one night\'s stay. No-shows will be charged the full amount of the reservation.'
};
