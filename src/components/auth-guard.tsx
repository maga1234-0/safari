'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser as useFirebaseAuthUser } from '@/firebase';
import { useUser as useAppUser } from '@/context/user-context';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useFirebaseAuthUser();
  const { role, isRoleLoading } = useAppUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Wait until the role information has been loaded and we have a user.
    if (!isRoleLoading && user) {
      if (role !== 'Admin') {
        // This user is logged in, but they are not an 'Admin' according to the staff collection.
        // This covers users whose role was changed from 'Admin' or who were deleted.
        toast({
          variant: 'destructive',
          title: 'Accès non autorisé',
          description: "Vous n'avez pas les autorisations d'administrateur nécessaires pour accéder à cette application.",
        });
        auth.signOut();
        router.push('/login');
      }
    }
  }, [role, isRoleLoading, user, auth, router, toast]);

  // While checking the user's role from Firestore, display a loader.
  if (isRoleLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // If the role is confirmed as 'Admin', render the application.
  if (role === 'Admin') {
      return <>{children}</>;
  }

  // If the user is not an admin, a loader is shown while the redirection happens.
  return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
}
