import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck2,
  Users,
  UserCog,
  Building,
  Home,
} from 'lucide-react';
import type { StaffRole } from './types';

export const allMenuItems: {
  href: string;
  icon: React.ReactNode;
  label: string;
  allowedRoles: StaffRole[];
}[] = [
    {
      href: '/dashboard',
      icon: <LayoutDashboard />,
      label: 'Tableau de bord',
      allowedRoles: ['Admin', 'Entretien ménager'],
    },
    {
      href: '/rooms',
      icon: <BedDouble />,
      label: 'Chambres',
      allowedRoles: ['Admin', 'Réception', 'Entretien ménager'],
    },
    {
      href: '/reservations',
      icon: <CalendarCheck2 />,
      label: 'Réservations',
      allowedRoles: ['Admin', 'Réception'],
    },
    {
      href: '/clients',
      icon: <Users />,
      label: 'Clients',
      allowedRoles: ['Admin'],
    },
    {
      href: '/staff',
      icon: <UserCog />,
      label: 'Personnel',
      allowedRoles: ['Admin'],
    },
    {
      href: '/configuration',
      icon: <Building />,
      label: 'Config Hôtel',
      allowedRoles: ['Admin'],
    },
  ];
