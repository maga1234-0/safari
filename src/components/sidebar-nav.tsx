'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck2,
  Users,
  CreditCard,
  Bot,
  LogOut,
  Home,
  UserCog,
  Building,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { useUser as useAppUser } from '@/context/user-context';
import { useMemo } from 'react';

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { role, isRoleLoading } = useAppUser();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = () => {
    auth.signOut();
    router.push('/login');
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
      href: '/staff',
      icon: <UserCog />,
      label: 'Staff',
    },
    {
      href: '/configuration',
      icon: <Building />,
      label: 'Hotel Config',
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

  const visibleMenuItems = useMemo(() => {
    if (isRoleLoading) {
      return [];
    }

    if (role === 'Admin') {
      const adminPages = ['/dashboard', '/rooms', '/reservations', '/clients'];
      return menuItems.filter(item => adminPages.includes(item.href));
    }

    return menuItems;
  }, [role, isRoleLoading]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Home className="h-8 w-8 text-sidebar-primary" />
          <h1 className="text-xl font-semibold font-headline text-primary-foreground group-data-[state=collapsed]:hidden">
            PMS safari
          </h1>
        </div>
      </SidebarHeader>
      <SidebarMenu>
        {visibleMenuItems.map((item) => (
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
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
