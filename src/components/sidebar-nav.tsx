'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck2,
  Users,
  LogOut,
  Home,
  UserCog,
  Building,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { useUser as useAppUser } from '@/context/user-context';

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
      label: 'Tableau de bord',
    },
    {
      href: '/rooms',
      icon: <BedDouble />,
      label: 'Chambres',
    },
    {
      href: '/reservations',
      icon: <CalendarCheck2 />,
      label: 'Réservations',
    },
    {
      href: '/clients',
      icon: <Users />,
      label: 'Clients',
    },
    {
      href: '/staff',
      icon: <UserCog />,
      label: 'Personnel',
    },
    {
      href: '/configuration',
      icon: <Building />,
      label: 'Config Hôtel',
    },
  ];

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
        {isRoleLoading ? (
          <>
            {Array.from({ length: menuItems.length }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            ))}
          </>
        ) : role ? (
          menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        ) : null}
      </SidebarMenu>
      <SidebarFooter className="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Déconnexion">
              <LogOut />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
