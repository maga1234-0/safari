'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { UserProvider } from '@/context/user-context';
import { NotificationProvider } from '@/context/notification-context';
import { useUser, useAuth } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const lastHiddenTime = useRef<number | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lastHiddenTime.current = Date.now();
      } else if (document.visibilityState === 'visible') {
        if (lastHiddenTime.current && (Date.now() - lastHiddenTime.current > 3000)) {
          auth.signOut();
          router.push('/login');
        }
        lastHiddenTime.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auth, router]);

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
        <AuthGuard>
          <SidebarProvider>
            <SidebarNav />
            <SidebarInset>
              <Header />
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background animate-fade-in">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </AuthGuard>
      </NotificationProvider>
    </UserProvider>
  );
}
