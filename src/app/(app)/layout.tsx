'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { UserProvider, useUser as useAppUser } from '@/context/user-context';
import { NotificationProvider } from '@/context/notification-context';
import { useUser as useFirebaseAuthUser, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { allMenuItems } from '@/lib/menu-config';

// Inner component to safely use context hooks
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading: isAuthLoading } = useFirebaseAuthUser();
  const { role, isRoleLoading } = useAppUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // If auth check is done and there's no user, redirect to login
    if (!isAuthLoading && !user) {
      router.push('/login');
      return;
    }

    // If auth and role checks are done, but the logged-in user has no role,
    // it means they've been deleted from the staff list. Sign them out.
    if (!isAuthLoading && user && !isRoleLoading && role === null) {
      toast({
        variant: 'destructive',
        title: 'Accès non autorisé',
        description: 'Votre compte a été supprimé. Vous avez été déconnecté.',
      });
      auth.signOut();
      // Redirect will be handled by the first condition in this useEffect on the next render cycle.
    }
  }, [user, isAuthLoading, role, isRoleLoading, router, auth, toast]);

  useEffect(() => {
    // This effect handles redirecting users if they land on a page they don't have access to.
    if (!isRoleLoading && role) {
      const allowedPaths = allMenuItems
        .filter(item => item.allowedRoles.includes(role))
        .map(item => item.href);

      // Check if the current path is allowed.
      if (allowedPaths.length > 0 && !allowedPaths.includes(pathname)) {
        // If not, redirect to the first page they are allowed to access.
        router.push(allowedPaths[0]);
      }
    }
  }, [role, isRoleLoading, pathname, router]);

  const isLoading = isAuthLoading || isRoleLoading;

  // Show loader while auth/role is being determined, or if there's no user (as redirect is happening)
  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // This prevents a flash of content if a user is logged in but has no role.
  // The useEffect above will handle the sign-out and redirect.
  if (role === null) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // Also show loader while redirecting to an authorized page to prevent content flicker
  const allowedPaths = allMenuItems
    .filter(item => role && item.allowedRoles.includes(role))
    .map(item => item.href);
  if (allowedPaths.length > 0 && !allowedPaths.includes(pathname)) {
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
