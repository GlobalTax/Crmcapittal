import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  Mail, 
  Calendar,
  Clock,
  Settings,
  UserPlus,
  Zap,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

const nav = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/contacts', label: 'Contactos', icon: <Users className="w-5 h-5" /> },
  { to: '/companies', label: 'Empresas', icon: <Building2 className="w-5 h-5" /> },
  { to: '/negocios', label: 'Negocios', icon: <TrendingUp className="w-5 h-5" /> },
  { to: '/proposals', label: 'Propuestas', icon: <FileText className="w-5 h-5" /> },
  { to: '/mandatos', label: 'Mandatos', icon: <Briefcase className="w-5 h-5" /> },
  { to: '/email', label: 'Email', icon: <Mail className="w-5 h-5" /> },
  { to: '/documents', label: 'Documentos', icon: <FileText className="w-5 h-5" /> },
  { to: '/calendar', label: 'Calendario', icon: <Calendar className="w-5 h-5" /> },
  { to: '/time-tracking', label: 'Time Tracking', icon: <Clock className="w-5 h-5" /> },
];

const adminNav = [
  { to: '/collaborators', label: 'Colaboradores', icon: <UserPlus className="w-5 h-5" /> },
  { to: '/users', label: 'Usuarios', icon: <Users className="w-5 h-5" /> },
  { to: '/integrations', label: 'Integraciones', icon: <Zap className="w-5 h-5" /> },
];

export function MinimalSidebar() {
  const { role } = useUserRole();
  const isAdmin = role === 'admin' || role === 'superadmin';

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">LegalCRM</h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1">Professional Suite</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`${isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        
        {isAdmin && (
          <>
            <div className="pt-6 pb-3">
              <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-3">
                Administración
              </div>
            </div>
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`${isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/50">
          © 2024 LegalCRM
        </div>
      </div>
    </aside>
  );
}