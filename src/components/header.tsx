'use client';

import * as React from 'react';
import { useTheme } from "next-themes";
import { useRouter } from 'next/navigation';
import {
  Bell,
  Moon,
  Sun,
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
import { useUser } from '@/context/user-context';

export function Header() {
  const [isMounted, setIsMounted] = React.useState(false);
  const { avatar, name } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();


  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

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
      
      {isMounted ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatar} alt="User avatar" />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{name} Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard')}>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Skeleton className="h-8 w-8 rounded-full" />
      )}
    </header>
  );
}
