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
        title: "Entrada Comercial",
        href: "/captacion",
      },
      {
        title: "Contactos",
        href: "/contacts",
      },
      {
        title: "Empresas",
        href: "/companies",
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
    title: "Administración",
    items: [
      {
        title: "Mandatos Compra",
        href: "/buying-mandates",
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
    ],
  },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { role } = useUserRole();

  const isAdmin = role === 'admin' || role === 'superadmin';

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
            // Hide admin section for non-admin users
            if (section.title === "Administración" && !isAdmin) {
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
