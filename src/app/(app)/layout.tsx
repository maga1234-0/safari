'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { UserProvider, useUser as useAppUser } from '@/context/user-context';
import { NotificationProvider } from '@/context/notification-context';
import { useUser as useFirebaseAuthUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

// Inner component to safely use context hooks
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading: isAuthLoading } = useFirebaseAuthUser();
  const { isRoleLoading } = useAppUser();
  const router = useRouter();

  useEffect(() => {
    // If auth check is done and there's no user, redirect to login
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const isLoading = isAuthLoading || isRoleLoading;

  // Show loader while auth/role is being determined, or if there's no user (as redirect is happening)
  if (isLoading || !user) {
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
