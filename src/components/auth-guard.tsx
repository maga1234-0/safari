'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser as useFirebaseAuthUser } from '@/firebase';
import { useUser as useAppUser } from '@/context/user-context';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// THIS COMPONENT IS NO LONGER IN USE but is kept to avoid breaking imports.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
