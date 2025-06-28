
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  BarChart3,
  FileText,
  Search,
  Users,
  Settings,
  Building2,
  Target,
  PieChart
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
}

export const Sidebar = ({ isCollapsed = false }: SidebarProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Vista general del sistema'
    },
    {
      name: 'Deals',
      href: '/deals',
      icon: Building2,
      description: 'Gestión de operaciones M&A'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Análisis y métricas'
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText,
      description: 'Reportes detallados'
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      description: 'Búsqueda inteligente'
    },
    {
      name: 'Management',
      href: '/management',
      icon: Users,
      description: 'Gestión de usuarios'
    }
  ];

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Target className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">Capittal M&A</h1>
              <p className="text-xs text-gray-600">CRM Especializado</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              title={isCollapsed ? item.description : undefined}
            >
              <Icon className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
              {!isCollapsed && (
                <span>{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/settings"
          className={cn(
            "flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors",
            isActive('/settings') && "bg-blue-50 text-blue-700 border border-blue-200"
          )}
        >
          <Settings className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
          {!isCollapsed && <span>Configuración</span>}
        </Link>
      </div>
    </div>
  );
};
