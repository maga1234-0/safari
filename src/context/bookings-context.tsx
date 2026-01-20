'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Booking } from '@/lib/types';
import { recentBookings as initialBookings } from '@/lib/data';

interface BookingsContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBooking: (booking: Booking) => void;
  deleteBooking: (bookingId: string) => void;
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const addBooking = (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...booking,
      id: `BK${Math.floor(Math.random() * 1000) + 100}`,
      createdAt: new Date(),
    };
    setBookings(prevBookings => [newBooking, ...prevBookings]);
  };

  const updateBooking = (updatedBooking: Booking) => {
    setBookings(prevBookings =>
      prevBookings.map(b => (b.id === updatedBooking.id ? updatedBooking : b))
    );
  };

  const deleteBooking = (bookingId: string) => {
    setBookings(prevBookings => prevBookings.filter(b => b.id !== bookingId));
  };

  return (
    <BookingsContext.Provider value={{ bookings, addBooking, updateBooking, deleteBooking }}>
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingsContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
}
