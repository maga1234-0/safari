'use client';

import * as React from 'react';
import { useTheme } from "next-themes";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { useNotifications } from '@/context/notification-context';

export function Header() {
  const [isMounted, setIsMounted] = React.useState(false);
  const { avatar, name } = useAppUser();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const auth = useAuth();
  const { user: firebaseUser } = useFirebaseAuthUser();
  const { notifications, clearNotifications } = useNotifications();


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
            <span className="sr-only">Changer de thème</span>
          </Button>
      ) : <Skeleton className="h-8 w-8" />}


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            {notifications.length > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
            <Bell className="h-4 w-4" />
            <span className="sr-only">Basculer les notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length > 0 ? (
            <>
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} asChild className="cursor-pointer">
                  <Link href={notification.link || '#'}>
                    {notification.message}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearNotifications} className="justify-center cursor-pointer">
                Tout effacer
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem disabled>Aucune nouvelle notification</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
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
            <DropdownMenuLabel>Compte {firebaseUser.displayName || name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <User className="mr-2" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Skeleton className="h-8 w-8 rounded-full" />
      )}
    </header>
  );
}
