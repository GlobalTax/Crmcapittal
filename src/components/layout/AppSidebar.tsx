import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Users,
  Building,
  Calendar,
  FileText,
  Settings,
  Mail,
  Target,
  DollarSign,
  ChevronRight,
  Phone,
  Timer,
  ArrowLeftRight
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
        title: "Leads",
        href: "/leads",
        icon: Target,
      },
      {
        title: "Contactos",
        href: "/contacts",
        icon: Users,
      },
      {
        title: "Empresas",
        href: "/companies",
        icon: Building,
      },
      {
        title: "Negocios",
        href: "/negocios",
        icon: DollarSign,
      },
    ],
  },
  {
    title: "Ventas & Negocios",
    items: [
      {
        title: "Propuestas",
        href: "/proposals",
        icon: FileText,
      },
      {
        title: "Transacciones M&A",
        href: "/transactions",
        icon: ArrowLeftRight,
      },
      {
        title: "Documentos",
        href: "/documents",
        icon: FileText,
      },
    ],
  },
  {
    title: "Comunicación",
    items: [
      {
        title: "Email",
        href: "/email",
        icon: Mail,
      },
      {
        title: "Calendario",
        href: "/calendar",
        icon: Calendar,
      },
      {
        title: "Time Tracking",
        href: "/time-tracking",
        icon: Timer,
      },
    ],
  },
];

export const AppSidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-gray-900 text-white h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">CRM Pro</h1>
            <p className="text-xs text-gray-400">M&A Platform</p>
          </div>
        </div>

        <nav className="space-y-6">
          {sidebarData.map((section) => (
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
                          "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};
