
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';

interface SidebarItem {
  title: string;
  href: string;
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
        title: "Dashboard Personal",
        href: "/personal",
      },
      {
        title: "Gestión Integral",
        href: "/crm",
      },
      {
        title: "Control Leads",
        href: "/control-leads",
        badge: "1",
      },
      {
        title: "Gestión de Leads",
        href: "/leads",
      },
      {
        title: "Contactos",
        href: "/contactos",
      },
      {
        title: "Empresas", 
        href: "/empresas",
      },
      {
        title: "Mandatos",
        href: "/mandatos",
      },
    ],
  },
  {
    title: "M&A Operations",
    items: [
      {
        title: "Transacciones",
        href: "/transacciones",
      },
      {
        title: "Valoraciones",
        href: "/valoraciones",
      },
      {
        title: "Reconversiones",
        href: "/reconversiones",
      },
      {
        title: "Negocios",
        href: "/deals",
      },
    ],
  },
  {
    title: "Ventas & Negocios",
    items: [
      {
        title: "Propuestas",
        href: "/proposals",
      },
      {
        title: "Documentos",
        href: "/documents",
      },
    ],
  },
  {
    title: "Comunicación",
    items: [
      {
        title: "Email",
        href: "/email",
      },
      {
        title: "Calendario",
        href: "/calendar",
      },
      {
        title: "Time Tracking",
        href: "/time-tracking",
      },
    ],
  },
  {
    title: "Análisis & Data",
    items: [
      {
        title: "eInforma Dashboard",
        href: "/einforma",
      },
    ],
  },
  {
    title: "ROD Builder",
    items: [
      {
        title: "Teaser Builder",
        href: "/teaser-builder",
      },
      {
        title: "Crear ROD",
        href: "/rod",
      },
      {
        title: "Gestionar Suscriptores",
        href: "/subscribers",
      },
      {
        title: "Campañas de Email",
        href: "/campaigns",
      },
    ],
  },
  {
    title: "Administración",
    items: [
      {
        title: "Base de Datos HubSpot",
        href: "/hubspot",
      },
      {
        title: "Gestión de Mandatos",
        href: "/admin-mandatos",
      },
      {
        title: "Colaboradores",
        href: "/collaborators",
      },
      {
        title: "Gestión de Usuarios",
        href: "/users",
      },
      {
        title: "Integraciones",
        href: "/integrations",
      },
      {
        title: "Comisiones",
        href: "/comisiones",
      },
    ],
  },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { role, loading } = useUserRole();

  // Debug logs to see what's happening
  console.log('AppSidebar: Rendering sidebar');
  console.log('AppSidebar: Role:', role);
  console.log('AppSidebar: Loading:', loading);
  console.log('AppSidebar: Location:', location.pathname);

  const isAdmin = role === 'admin' || role === 'superadmin';
  console.log('AppSidebar: IsAdmin:', isAdmin);

  // Add a loading state
  if (loading) {
    console.log('AppSidebar: Still loading role, showing loading state');
    return (
      <div className="w-64 bg-gray-900 text-white h-full overflow-y-auto">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('AppSidebar: Rendering full sidebar');

  return (
    <div className="w-64 bg-gray-900 text-white h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">CRM Pro</h1>
            <p className="text-xs text-gray-400">M&A Platform</p>
          </div>
        </div>

        <nav className="space-y-6">
          {sidebarData.map((section) => {
            console.log('AppSidebar: Rendering section:', section.title);
            
            // Hide admin section for non-admin users
            if (section.title === "Administración" && !isAdmin) {
              console.log('AppSidebar: Hiding admin section for non-admin user');
              return null;
            }

            return (
              <div key={section.title}>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h2>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? "bg-blue-600 text-white"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white"
                          )}
                        >
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
