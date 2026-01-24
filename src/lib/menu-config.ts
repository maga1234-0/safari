import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck2,
  Users,
  UserCog,
  Building,
  type LucideProps
} from 'lucide-react';
import type { StaffRole } from './types';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

export const allMenuItems: {
  href: string;
  icon: LucideIcon;
  label: string;
  allowedRoles: StaffRole[];
}[] = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Tableau de bord',
      allowedRoles: ['Admin'],
    },
    {
      href: '/rooms',
      icon: BedDouble,
      label: 'Chambres',
      allowedRoles: ['Admin', 'Réception', 'Entretien ménager'],
    },
    {
      href: '/reservations',
      icon: CalendarCheck2,
      label: 'Réservations',
      allowedRoles: ['Admin', 'Réception'],
    },
    {
      href: '/clients',
      icon: Users,
      label: 'Clients',
      allowedRoles: ['Admin'],
    },
    {
      href: '/staff',
      icon: UserCog,
      label: 'Personnel',
      allowedRoles: [],
    },
    {
      href: '/configuration',
      icon: Building,
      label: 'Config Hôtel',
      allowedRoles: ['Admin'],
    },
  ];
