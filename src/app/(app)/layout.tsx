'use client';

import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { BookingsProvider } from '@/context/bookings-context';
import { UserProvider } from '@/context/user-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <BookingsProvider>
        <SidebarProvider>
          <SidebarNav />
          <SidebarInset>
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </BookingsProvider>
    </UserProvider>
  );
}
