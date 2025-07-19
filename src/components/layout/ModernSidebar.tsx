
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  FileText, 
  Mail, 
  Calendar, 
  Clock, 
  UserPlus, 
  Settings, 
  Zap,
  TrendingUp,
  Database,
  DollarSign,
  Target,
  Users2,
  Send,
  Calculator,
  RefreshCw,
  FileImage,
  ChevronDown
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
  collapsible?: boolean;
}

const sidebarSections: SidebarSection[] = [
  {
    title: "Dashboard",
    items: [
      { title: "Dashboard Personal", href: "/personal", icon: LayoutDashboard },
      { title: "Control de Leads", href: "/", icon: TrendingUp },
    ]
  },
  {
    title: "CRM",
    items: [
      { title: "Contactos", href: "/contactos", icon: Users },
      { title: "Empresas", href: "/empresas", icon: Building2 },
    ]
  },
  {
    title: "M&A Operations",
    items: [
      { title: "Mandatos de Venta", href: "/transacciones", icon: Briefcase },
      { title: "Mandatos de Compra", href: "/mandatos-compra", icon: FileText },
      { title: "Valoraciones", href: "/valoraciones", icon: Calculator },
      { title: "Reconversiones", href: "/reconversiones", icon: RefreshCw },
      { title: "Teaser Builder", href: "/teaser-builder", icon: FileImage },
    ]
  },
  {
    title: "Comunicación",
    items: [
      { title: "Email", href: "/email", icon: Mail },
      { title: "Calendario", href: "/calendar", icon: Calendar },
      { title: "Time Tracking", href: "/time-tracking", icon: Clock },
    ]
  },
  {
    title: "ROD Builder",
    items: [
      { title: "Crear ROD", href: "/rod", icon: Target },
      { title: "Gestionar Suscriptores", href: "/subscribers", icon: Users2 },
      { title: "Campañas de Email", href: "/campaigns", icon: Send },
    ]
  },
  {
    title: "Análisis",
    items: [
      { title: "eInforma Dashboard", href: "/einforma", icon: Database },
    ]
  }
];

const adminSection: SidebarSection = {
  title: "Administración",
  items: [
    { title: "Colaboradores", href: "/colaboradores", icon: UserPlus },
    { title: "Usuarios", href: "/users", icon: Users },
    { title: "Comisiones", href: "/comisiones", icon: DollarSign },
    { title: "Integraciones", href: "/integrations", icon: Zap },
  ]
};

export const ModernSidebar = () => {
  const location = useLocation();
  const { role } = useUserRole();
  const [collapsedSections, setCollapsedSections] = React.useState<string[]>([]);

  const isAdmin = role === 'admin' || role === 'superadmin';
  const allSections = [...sidebarSections, ...(isAdmin ? [adminSection] : [])];

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        {/* Brand Section */}
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">CRM Pro</h1>
            <p className="text-xs text-gray-500">M&A Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-8">
          {allSections.map((section) => {
            const isCollapsed = collapsedSections.includes(section.title);
            
            return (
              <div key={section.title}>
                <div 
                  className={cn(
                    "flex items-center justify-between mb-3",
                    section.collapsible && "cursor-pointer"
                  )}
                  onClick={() => section.collapsible && toggleSection(section.title)}
                >
                  <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </h2>
                  {section.collapsible && (
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 text-gray-400 transition-transform",
                        isCollapsed && "rotate-180"
                      )} 
                    />
                  )}
                </div>
                
                {(!section.collapsible || !isCollapsed) && (
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      const Icon = item.icon;
                      
                      return (
                        <li key={item.href}>
                          <Link
                            to={item.href}
                            className={cn(
                              "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                              isActive
                                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            <Icon className={cn(
                              "mr-3 h-4 w-4 flex-shrink-0",
                              isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
                            )} />
                            <span className="flex-1 truncate">{item.title}</span>
                            {item.badge && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
