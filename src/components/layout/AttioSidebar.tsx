import { NavLink, useLocation } from 'react-router-dom';
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
  Database
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Principal",
    items: [
      { to: '/personal', label: 'Dashboard Personal', icon: LayoutDashboard },
      { to: '/', label: 'Control Leads', icon: LayoutDashboard },
      { to: '/contacts', label: 'Contactos', icon: Users },
      { to: '/companies', label: 'Empresas', icon: Building2 },
    ]
  },
  {
    title: "Ventas & Transacciones",
    items: [
      { to: '/deals', label: 'Oportunidades', icon: TrendingUp },
      { to: '/transacciones', label: 'Transacciones', icon: Briefcase },
      { to: '/buying-mandates', label: 'Mandatos de Compra', icon: FileText },
      { to: '/proposals', label: 'Propuestas', icon: FileText },
      { to: '/documents', label: 'Documentos', icon: FileText },
    ]
  },
  {
    title: "Comunicación",
    items: [
      { to: '/email', label: 'Email', icon: Mail },
      { to: '/calendar', label: 'Calendario', icon: Calendar },
      { to: '/time-tracking', label: 'Control de Tiempo', icon: Clock },
    ]
  },
  {
    title: "Análisis & Data",
    items: [
      { to: '/einforma', label: 'eInforma Dashboard', icon: Database },
    ]
  }
];

const adminSection: NavSection = {
  title: "Administración",
  items: [
    { to: '/collaborators', label: 'Colaboradores', icon: UserPlus },
    { to: '/users', label: 'Gestión de Usuarios', icon: Users },
    { to: '/integrations', label: 'Integraciones', icon: Zap },
  ]
};

export function AttioSidebar() {
  const location = useLocation();
  const { role } = useUserRole();
  const isAdmin = role === 'admin' || role === 'superadmin';

  const allSections = [...navigationSections, ...(isAdmin ? [adminSection] : [])];

  return (
    <aside className="w-60 bg-neutral-100 border-r border-neutral-100 flex flex-col">
      {/* Brand Section */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          <div>
            <h1 className="font-semibold text-neutral-900">CRM Pro</h1>
            <p className="text-xs text-gray-500">M&A Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {allSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h2>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;
                
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-neutral-0 text-neutral-900 shadow-sm'
                            : 'text-gray-600 hover:bg-neutral-0 hover:text-neutral-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer with user info or additional actions */}
      <div className="p-4 border-t border-neutral-100">
        <NavLink 
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
              isActive
                ? 'bg-neutral-0 text-neutral-900 shadow-sm'
                : 'hover:bg-neutral-0 text-gray-600 hover:text-neutral-900'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>Configuración</span>
        </NavLink>
      </div>
    </aside>
  );
}