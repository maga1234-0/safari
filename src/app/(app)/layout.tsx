'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { UserProvider, useUser as useAppUser } from '@/context/user-context';
import { NotificationProvider } from '@/context/notification-context';
import { useUser as useFirebaseAuthUser, useAuth } from '@/firebase';
import { Loader2 } from 'lucide-react';

// Inner component to safely use context hooks
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading: isAuthLoading } = useFirebaseAuthUser();
  const { role, isRoleLoading: isRoleCheckLoading } = useAppUser();
  const router = useRouter();
  const auth = useAuth();
  const lastHiddenTime = useRef<number | null>(null);

  useEffect(() => {
    // If auth check is done and there's no user, redirect to login
    if (!isAuthLoading && !user) {
      router.push('/login');
      return;
    }

    // After all loading is done, if there's a user but no role, log them out.
    // This effectively bars deleted users from accessing the app.
    if (!isAuthLoading && !isRoleCheckLoading && user && !role) {
      auth.signOut();
      router.push('/login');
    }
  }, [user, isAuthLoading, role, isRoleCheckLoading, router, auth]);

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

  // Show loader until both auth state and user role are resolved
  if (isAuthLoading || isRoleCheckLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background animate-fade-in">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <NotificationProvider>
        <ProtectedLayout>{children}</ProtectedLayout>
      </NotificationProvider>
    </UserProvider>
  );
}
