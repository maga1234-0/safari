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
import { useSessionTimeout } from '@/hooks/use-session-timeout';

// Inner component to safely use context hooks
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading: isAuthLoading } = useFirebaseAuthUser();
  const { role, isRoleLoading } = useAppUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useSessionTimeout();

  useEffect(() => {
    // If auth check is done and there's no user, redirect to login
    if (!isAuthLoading && !user) {
      router.push('/login');
      return;
    }

    // If auth and role checks are done, but the logged-in user has no role,
    // it means they've been deleted from the staff list. Sign them out.
    if (!isAuthLoading && user && user.email !== 'safari@gmail.com' && !isRoleLoading && role === null) {
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
    const isReadyForCheck = !isRoleLoading && user;

    if (isReadyForCheck) {
      // Define all paths the user is allowed to see.
      let allowedPaths: string[] = [];

      // Add role-based paths
      if (role) {
        allowedPaths.push(...allMenuItems
          .filter(item => item.allowedRoles.includes(role))
          .map(item => item.href));
      }

      // Add special path for safari@gmail.com
      if (user.email === 'safari@gmail.com') {
        if (!allowedPaths.includes('/staff')) {
          allowedPaths.push('/staff');
        }
      }

      // All logged-in users can access their own settings page
      allowedPaths.push('/settings');

      // If a user has no roles/pages assigned, they can't use the app.
      if (allowedPaths.length === 0 && user.email !== 'safari@gmail.com') {
        toast({
          variant: 'destructive',
          title: 'Accès non configuré',
          description: "Votre rôle n'a accès à aucune page. Veuillez contacter un administrateur.",
        });
        auth.signOut();
        return; // Exit early
      }
      
      // Now check if the current path is in the allowed list.
      if (allowedPaths.length > 0 && !allowedPaths.includes(pathname)) {
        // If not, redirect to the first available path.
        router.push(allowedPaths[0]);
      }
    }
  }, [role, isRoleLoading, pathname, router, user, auth, toast]);

  const isLoading = isAuthLoading || isRoleLoading;

  // Show loader while auth/role is being determined, or if there's no user (as redirect is happening)
  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // This prevents a flash of content if a user is logged in but has no role, or is being redirected.
  if (role === null && user.email !== 'safari@gmail.com') {
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
