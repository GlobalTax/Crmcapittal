import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GlobalSearchDialog } from './GlobalSearchDialog';

// Breadcrumb mapping for routes
const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/personal': 'Dashboard Personal',
  '/contacts': 'Contactos',
  '/companies': 'Empresas',
  '/negocios': 'Negocios',
  '/proposals': 'Propuestas',
  '/documents': 'Documentos',
  '/email': 'Email',
  '/calendar': 'Calendario',
  '/time-tracking': 'Time Tracking',
  '/collaborators': 'Colaboradores',
  '/users': 'Gestión de Usuarios',
  '/integrations': 'Integraciones',
};

export function AttioTopbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const currentTitle = routeTitles[location.pathname] || 'Dashboard';
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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
      <header className="sticky top-0 z-40 w-full border-b bg-neutral-0/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-0/60 shadow-sm">
        <div className="flex h-16 items-center justify-between px-6 py-3">
          {/* Left: Breadcrumb/Title */}
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-neutral-900">
              {currentTitle}
            </h1>
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

          {/* Right: Context Actions & Avatar */}
          <div className="flex items-center gap-4">
            {/* Context actions can be added here based on current route */}
            <Button variant="ghost" size="sm" className="text-gray-600">
              Filtros
            </Button>
            
            <Button variant="ghost" size="sm" className="text-gray-600">
              Exportar
            </Button>

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
                <DropdownMenuItem>
                  <span>Mi perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Ayuda y soporte</span>
                </DropdownMenuItem>
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