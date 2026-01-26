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
  LogOut,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser as useFirebaseAuthUser } from '@/firebase';
import { useUser as useAppUser } from '@/context/user-context';
import { allMenuItems } from '@/lib/menu-config';

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { role, isRoleLoading } = useAppUser();
  const { user: firebaseUser } = useFirebaseAuthUser();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = () => {
    auth.signOut();
    router.push('/login');
  };

  const menuItems = allMenuItems.filter(item => {
    // Special rule for the staff page
    if (item.href === '/staff') {
      return firebaseUser?.email === 'safari@gmail.com';
    }
    // Regular role-based filtering for other items
    if (!role) return false;
    return item.allowedRoles.includes(role);
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Home className="h-8 w-8 text-sidebar-primary" />
          <h1 className="text-xl font-semibold font-headline text-primary-foreground group-data-[state=collapsed]:hidden">
            safari hotel manager
          </h1>
        </div>
      </SidebarHeader>
      <SidebarMenu>
        {isRoleLoading && !firebaseUser ? (
          <>
            {Array.from({ length: 4 }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            ))}
          </>
        ) : (
          menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                  <Link href={item.href}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })
        )}
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
