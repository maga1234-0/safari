'use client';

import * as React from 'react';
import { useTheme } from "next-themes";
import { useRouter } from 'next/navigation';
import {
  Bell,
  LogOut,
  Moon,
  Sun,
  User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from './ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { useUser as useAppUser } from '@/context/user-context';
import { useAuth, useUser as useFirebaseAuthUser } from '@/firebase';

export function Header() {
  const [isMounted, setIsMounted] = React.useState(false);
  const { avatar, name } = useAppUser();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const auth = useAuth();
  const { user: firebaseUser } = useFirebaseAuthUser();


  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    auth.signOut();
    router.push('/login');
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <SidebarTrigger />
      <div className="w-full flex-1" />

      {isMounted ? (
         <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
      ) : <Skeleton className="h-8 w-8" />}


      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
      
      {isMounted && firebaseUser ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={firebaseUser.photoURL || avatar} alt="User avatar" />
                <AvatarFallback>{getInitials(firebaseUser.displayName || name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{firebaseUser.displayName || name} Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <User className="mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Skeleton className="h-8 w-8 rounded-full" />
      )}
    </header>
  );
}
