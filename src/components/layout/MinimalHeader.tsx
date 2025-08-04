import { useAuth } from '@/stores/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HelpCircle, Bell, Search, ChevronRight } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Input } from '@/components/ui/input';

export function MinimalHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { resetOnboarding } = useOnboarding();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";

  // Generate breadcrumbs from current path
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Inicio', path: '/' }];
    
    const routeLabels: Record<string, string> = {
      'contacts': 'Contactos',
      'companies': 'Empresas',
      'negocios': 'Negocios',
      'proposals': 'Propuestas',
      'mandatos': 'Mandatos',
      'email': 'Email',
      'documents': 'Documentos',
      'calendar': 'Calendario',
      'time-tracking': 'Time Tracking',
      'collaborators': 'Colaboradores',
      'users': 'Usuarios',
      'integrations': 'Integraciones'
    };

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, path });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 lg:px-8">
      {/* Left side - Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />}
            <span 
              className={`${
                index === breadcrumbs.length - 1 
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground hover:text-foreground cursor-pointer'
              }`}
              onClick={() => index < breadcrumbs.length - 1 && navigate(crumb.path)}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right side - Search and Actions */}
      <div className="flex items-center gap-4">
        {/* Global Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-10 w-64 bg-background"
          />
        </div>

        {/* Notifications */}
        <div data-tour="notifications-center">
          <Button variant="ghost" size="sm" className="relative h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"></span>
          </Button>
        </div>
        
        {/* Help */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 w-9"
          onClick={resetOnboarding}
          title="Ver guía para nuevos usuarios"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
        
        {/* User Avatar */}
        <button 
          onClick={handleSignOut}
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center hover:bg-primary-hover transition-colors shadow-sm"
          title="Cerrar sesión"
        >
          {userInitials}
        </button>
      </div>
    </header>
  );
}