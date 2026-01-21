'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { useUser as useFirebaseAuthUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { StaffMember, StaffRole } from '@/lib/types';

interface UserContextType {
  avatar: string;
  setAvatar: (avatarUrl: string) => void;
  name: string;
  setName: (name: string) => void;
  role: StaffRole | null;
  isRoleLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useFirebaseAuthUser();
  const firestore = useFirestore();
  
  const [avatar, setAvatar] = useState<string>('');
  const [name, setName] = useState<string>('Admin');

  const staffQuery = useMemoFirebase(() => {
    if (!firestore || !user?.email) {
      return null;
    }
    return query(collection(firestore, 'staff'), where('email', '==', user.email));
  }, [firestore, user?.email]);
  
  const { data: staff, isLoading: isStaffLoading } = useCollection<StaffMember>(staffQuery);

  const role = useMemo(() => staff?.[0]?.role ?? null, [staff]);

  useEffect(() => {
    if (user) {
      setName(staff?.[0]?.name || user.displayName || 'Admin');
      setAvatar(user.photoURL || '');
    }
  }, [user, staff]);

  return (
    <UserContext.Provider value={{ avatar, setAvatar, name, setName, role, isRoleLoading: isStaffLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
