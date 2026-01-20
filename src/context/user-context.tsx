'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface UserContextType {
  avatar: string;
  setAvatar: (avatarUrl: string) => void;
  name: string;
  setName: (name: string) => void;
}

const userAvatarPlaceholder = PlaceHolderImages.find(p => p.id === 'user-avatar-1');

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [avatar, setAvatar] = useState<string>(userAvatarPlaceholder?.imageUrl || '');
  const [name, setName] = useState<string>('Admin');

  return (
    <UserContext.Provider value={{ avatar, setAvatar, name, setName }}>
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
