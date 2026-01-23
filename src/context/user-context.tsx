'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser as useFirebaseAuthUser } from '@/firebase';
import type { StaffRole } from '@/lib/types';

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
  
  const [avatar, setAvatar] = useState<string>('');
  const [name, setName] = useState<string>('');

  useEffect(() => {
    if (user) {
      // Use display name and photo from the Firebase user object directly.
      setName(user.displayName || 'Admin');
      setAvatar(user.photoURL || '');
    }
  }, [user]);

  const value = {
    avatar,
    setAvatar,
    name,
    setName,
    // We are no longer fetching the role from Firestore here.
    // We'll return a default 'Admin' role and `false` for loading
    // to ensure components like the sidebar still render correctly
    // without doing the expensive/complex role check.
    role: 'Admin' as StaffRole,
    isRoleLoading: false
  };

  return (
    <UserContext.Provider value={value}>
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
