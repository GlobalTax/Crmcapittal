import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  Home, 
  Users, 
  Building2, 
  FileText, 
  TrendingUp, 
  Mail, 
  Calendar,
  Clock,
  BarChart3,
  Briefcase,
  FileSpreadsheet,
  Phone,
  Settings,
  Plus,
  Search,
  Timer,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const sidebarData: SidebarSection[] = [
  {
    title: "Principal",
    items: [
      {
        title: "Dashboard",
        href: "/personal",
        icon: Home,
      },
      {
        title: "Contactos",
        href: "/contactos",
        icon: Users,
      },
      {
        title: "Empresas", 
        href: "/empresas",
        icon: Building2,
      },
      {
        title: "Leads",
        href: "/captacion",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "M&A Operations",
    items: [
      {
        title: "Transacciones",
        href: "/transacciones",
        icon: Briefcase,
      },
      {
        title: "Negocios",
        href: "/deals",
        icon: TrendingUp,
      },
      {
        title: "Mandatos",
        href: "/mandatos",
        icon: FileText,
      },
    ],
  },
  {
    title: "Herramientas",
    items: [
      {
        title: "Calendario",
        href: "/calendar",
        icon: Calendar,
      },
      {
        title: "Control de Tiempo",
        href: "/tiempo",
        icon: Clock,
      },
      {
        title: "Email",
        href: "/email",
        icon: Mail,
      },
      {
        title: "Documentos",
        href: "/documents",
        icon: FileSpreadsheet,
      },
    ],
  },
  {
    title: "Análisis",
    items: [
      {
        title: "Reportes",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        title: "eInforma",
        href: "/einforma",
        icon: Activity,
      },
    ],
  }
];

const quickActions = [
  { label: "Nuevo Lead", href: "/captacion", icon: Plus },
  { label: "Nueva Tarea", href: "/tasks", icon: Plus },
  { label: "Buscar", href: "/search", icon: Search },
];

export const LegalCrmSidebar = () => {
  const location = useLocation();
  const { role } = useUserRole();

  const isAdmin = role === 'admin' || role === 'superadmin';

  return (
    <div className="w-64 bg-sidebar h-full overflow-y-auto border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-sm">L</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">LegalCRM</h1>
            <p className="text-xs text-sidebar-foreground/70">M&A Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <nav className="space-y-6">
          {sidebarData.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-3">
                {section.title}
              </h2>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Admin Section */}
          {isAdmin && (
            <div>
              <h2 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-3">
                Administración
              </h2>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/users"
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      location.pathname === "/users"
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Configuración</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </nav>
      </div>

      {/* Quick Actions */}
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">
            Acciones Rápidas
          </h3>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                asChild
              >
                <Link to={action.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};