
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Filter, Download, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

// Breadcrumb mapping
const routeTitles: Record<string, { title: string; parent?: string }> = {
  '/': { title: 'Dashboard' },
  '/personal': { title: 'Dashboard Personal' },
  '/contactos': { title: 'Contactos' },
  '/empresas': { title: 'Empresas' },
  '/transacciones': { title: 'Mandatos de Venta' },
  '/mandatos-compra': { title: 'Mandatos de Compra' },
  '/valoraciones': { title: 'Valoraciones' },
  '/proposals': { title: 'Propuestas' },
  '/email': { title: 'Email' },
  '/calendar': { title: 'Calendario' },
  '/collaborators': { title: 'Colaboradores' },
  '/users': { title: 'Usuarios' },
  '/comisiones': { title: 'Comisiones' },
  '/integrations': { title: 'Integraciones' },
};

const periodOptions = [
  { label: 'Últimos 7 días', value: '7d' },
  { label: 'Últimos 30 días', value: '30d' },
  { label: 'Últimos 3 meses', value: '3m' },
  { label: 'Último año', value: '1y' },
];

export const ModernHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const currentRoute = routeTitles[location.pathname];
  const pageTitle = currentRoute?.title || 'Dashboard';
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Usuario';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement global search logic here
      console.log('Searching for:', searchQuery);
    }
  };

  const selectedPeriodLabel = periodOptions.find(p => p.value === selectedPeriod)?.label || 'Últimos 30 días';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Breadcrumb + Page Title */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
            <span>CRM Pro</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{pageTitle}</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar contactos, empresas, mandatos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300"
            />
          </form>
        </div>

        {/* Right: Actions + User */}
        <div className="flex items-center space-x-4">
          {/* Period Selector - only show on dashboard pages */}
          {(location.pathname === '/' || location.pathname === '/personal') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedPeriodLabel}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {periodOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSelectedPeriod(option.value)}
                    className={selectedPeriod === option.value ? 'bg-blue-50 text-blue-700' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Action Buttons */}
          <Button variant="outline" size="sm" className="text-gray-600">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          
          <Button variant="outline" size="sm" className="text-gray-600">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4 text-gray-600" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 px-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">{userInitials}</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <Badge variant="secondary" className="text-xs">
                    {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Usuario'}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-gray-500">
                  {role === 'superadmin' ? 'Super Administrador' : role === 'admin' ? 'Administrador' : 'Usuario'}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
