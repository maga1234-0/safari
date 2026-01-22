'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { UserProvider } from '@/context/user-context';
import { NotificationProvider } from '@/context/notification-context';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <UserProvider>
      <NotificationProvider>
        <SidebarProvider>
          <SidebarNav />
          <SidebarInset>
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background animate-fade-in">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </NotificationProvider>
    </UserProvider>
  );
}
