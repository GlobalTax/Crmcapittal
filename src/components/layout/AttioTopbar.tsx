
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { GlobalSearchDialog } from './GlobalSearchDialog';

// Breadcrumb mapping for routes
const routeTitles: Record<string, string> = {
  // Principal
  '/': 'Control Leads',
  '/personal': 'Dashboard Personal',
  '/asignaciones': 'Control de Asignaciones',
  '/gestion-leads': 'Gestión de Leads',
  '/contactos': 'Contactos',
  '/contacts': 'Contactos',
  '/empresas': 'Empresas',
  '/companies': 'Empresas',
  
  // Ventas & Transacciones
  '/transacciones': 'Mandatos de Venta',
  '/mandatos': 'Mandatos de Compra',
  '/buying-mandates': 'Mandatos de Compra',
  '/valoraciones': 'Valoraciones',
  '/reconversiones': 'Reconversiones',
  '/proposals': 'Propuestas',
  '/documents': 'Documentos',
  
  // Comunicación
  '/email': 'Email',
  '/calendar': 'Calendario',
  '/tiempo': 'Control de Tiempo',
  '/time-tracking': 'Control de Tiempo',
  
  // Análisis & Data
  '/hubspot-data': 'Base de Datos HubSpot',
  '/einforma': 'eInforma Dashboard',
  
  // ROD Builder
  '/rod': 'Crear ROD',
  '/subscribers': 'Gestionar Suscriptores',
  '/campaigns': 'Campañas de Email',
  
  // Administración
  '/collaborators': 'Colaboradores',
  '/users': 'Gestión de Usuarios',
  '/comisiones': 'Comisiones',
  '/integrations': 'Integraciones',
  
  // Otros
  '/negocios': 'Negocios',
};

export function AttioTopbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Safe auth access with inline error handling
  let user = null;
  let signOut = async () => {};
  
  try {
    const auth = useAuth();
    user = auth.user;
    signOut = auth.signOut;
  } catch (error) {
    console.log('AttioTopbar: Auth context not available, using defaults');
    user = null;
    signOut = async () => {};
  }

  const pathname = location.pathname;
  const basePath = '/' + (pathname.split('/').filter(Boolean)[0] || '');
  const currentTitle = routeTitles[basePath] || routeTitles[pathname] || 'Dashboard';
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';

  const handleSignOut = async () => {
    if (signOut) {
      await signOut();
      navigate('/auth');
    }
  };

  // Global search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-6 py-3">
          {/* Left: Breadcrumb/Title + Search */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-neutral-900">
              {currentTitle}
            </h1>
            
            {/* Negocios Search Bar */}
            {location.pathname === '/negocios' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar negocios..."
                  className="h-10 w-[360px] border border-neutral-100 rounded-[var(--radius)] bg-neutral-0 placeholder:text-neutral-400 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                  onChange={(e) => {
                    // Dispatch custom event for search
                    window.dispatchEvent(new CustomEvent('negociosSearch', { 
                      detail: { query: e.target.value } 
                    }));
                  }}
                />
              </div>
            )}
          </div>

          {/* Center: Global Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-start text-sm text-gray-500 bg-neutral-100/50 border-neutral-100 hover:bg-neutral-100"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Buscar en todo...</span>
                <div className="ml-auto flex items-center gap-1">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-neutral-0 px-1.5 font-mono text-[10px] font-medium text-gray-500">
                    <Command className="h-3 w-3" />
                    K
                  </kbd>
                </div>
              </Button>
            </div>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-4">
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{user?.email}</p>
                    <p className="text-xs text-gray-500">Usuario activo</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearchDialog 
        open={searchOpen} 
        onOpenChange={setSearchOpen} 
      />
    </>
  );
}
