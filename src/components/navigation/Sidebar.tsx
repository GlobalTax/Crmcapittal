
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  FileText,
  Search,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';

interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const location = useLocation();
  const { role } = useUserRole();

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Vista general'
    },
    {
      title: 'Deals',
      href: '/deals',
      icon: Building2,
      description: 'Gestión de operaciones'
    },
    {
      title: 'Contactos',
      href: '/contacts',
      icon: Users,
      description: 'Gestión de contactos'
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Análisis y métricas'
    },
    {
      title: 'Reportes',
      href: '/reports',
      icon: FileText,
      description: 'Reportes personalizados'
    },
    {
      title: 'Búsqueda',
      href: '/search',
      icon: Search,
      description: 'Búsqueda inteligente'
    }
  ];

  // Add management section for admins
  if (role === 'admin' || role === 'superadmin') {
    navigationItems.push({
      title: 'Gestión',
      href: '/management',
      icon: Settings,
      description: 'Administración'
    });
  }

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">M&A Platform</h1>
              <p className="text-xs text-gray-600">Gestión Integral</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
                           (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                    : "text-gray-700 hover:bg-gray-50"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
                {!isCollapsed && (
                  <div>
                    <div>{item.title}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className={cn(
          "text-xs text-gray-500",
          isCollapsed ? "text-center" : "text-left"
        )}>
          {!isCollapsed && (
            <>
              <p>© 2024 M&A Platform</p>
              <p>Versión 1.0</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
