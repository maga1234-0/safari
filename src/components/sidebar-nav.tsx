'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck2,
  Users,
  CreditCard,
  Bot,
  Settings,
  CircleHelp,
  LogOut,
  Compass,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItems = [
    {
      href: '/dashboard',
      icon: <LayoutDashboard />,
      label: 'Dashboard',
    },
    {
      href: '/rooms',
      icon: <BedDouble />,
      label: 'Rooms',
    },
    {
      href: '/reservations',
      icon: <CalendarCheck2 />,
      label: 'Reservations',
    },
    {
      href: '/clients',
      icon: <Users />,
      label: 'Clients',
    },
    {
      href: '/billing',
      icon: <CreditCard />,
      label: 'Billing',
    },
    {
      href: '/pricing',
      icon: <Bot />,
      label: 'Pricing Optimizer',
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Compass className="h-8 w-8 text-sidebar-primary" />
          <h1 className="text-xl font-semibold font-headline text-primary-foreground">
            Safari
          </h1>
        </div>
      </SidebarHeader>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
              <Link href={item.href}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter className="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/settings')} tooltip="Settings">
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
