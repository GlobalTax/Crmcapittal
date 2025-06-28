
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  Search,
  UserCheck,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Deals',
    href: '/deals',
    icon: Briefcase,
  },
  {
    title: 'Contactos',
    href: '/contacts',
    icon: Users,
  },
  {
    title: 'Time Tracking',
    href: '/time-tracking',
    icon: Clock,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Búsqueda',
    href: '/search',
    icon: Search,
  },
  {
    title: 'Gestores',
    href: '/managers',
    icon: UserCheck,
  },
  {
    title: 'Administración',
    href: '/admin',
    icon: Settings,
  },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">M&A CRM</h1>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
