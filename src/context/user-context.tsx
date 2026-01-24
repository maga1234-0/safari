'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser as useFirebaseAuthUser, useFirestore } from '@/firebase';
import type { StaffMember, StaffRole } from '@/lib/types';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';

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
  const { user, isUserLoading: isAuthLoading } = useFirebaseAuthUser();
  const firestore = useFirestore();
  
  const [avatar, setAvatar] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<StaffRole | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setAvatar(user.photoURL || '');
    } else {
      setName('');
      setAvatar('');
      setRole(null);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) {
      setIsRoleLoading(true);
      return;
    }
    
    if (!user || !firestore) {
      setRole(null);
      setIsRoleLoading(false);
      return;
    }
    
    setIsRoleLoading(true);

    const staffQuery = query(collection(firestore, 'staff'), where('uid', '==', user.uid));
    
    const unsubscribe = onSnapshot(staffQuery, (snapshot) => {
      if (!snapshot.empty) {
        const staffData = snapshot.docs[0].data() as StaffMember;
        setRole(staffData.role);
        setName(staffData.name); // Also update name from Firestore record
        setIsRoleLoading(false);
      } else {
        // If the user is authenticated but has no corresponding staff document
        if (user && user.email === 'safari@gmail.com') {
            // This is the designated admin user. Let's create their staff record.
            const staffDocRef = doc(collection(firestore, 'staff'));
            setDoc(staffDocRef, {
                uid: user.uid,
                name: 'Safari Admin',
                email: user.email,
                role: 'Admin',
            }).catch(e => {
                console.error("Failed to auto-create admin staff record:", e);
                setRole(null);
                setIsRoleLoading(false);
            });
            // We don't set isRoleLoading to false here; we wait for the snapshot to refire with the new data.
        } else {
             // This is a non-admin user who was deleted from staff list
            setRole(null);
            setIsRoleLoading(false);
        }
      }
    }, (error) => {
      console.error("Error fetching user role: ", error);
      setRole(null);
      setIsRoleLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, isAuthLoading]);

  const value = {
    avatar,
    setAvatar,
    name,
    setName,
    role,
    isRoleLoading: isAuthLoading || isRoleLoading
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
