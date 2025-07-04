import { NavLink } from 'react-router-dom';
import { User, Mail, Briefcase } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

const nav = [
  { to: '/', label: 'Dashboard', icon: <User className="w-4 h-4" /> },
  { to: '/contacts', label: 'Contactos', icon: <User className="w-4 h-4" /> },
  { to: '/negocios', label: 'Negocios', icon: <Briefcase className="w-4 h-4" /> },
  { to: '/proposals', label: 'Propuestas', icon: <Mail className="w-4 h-4" /> },
  { to: '/email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { to: '/companies', label: 'Empresas', icon: <Briefcase className="w-4 h-4" /> },
  { to: '/documents', label: 'Documentos', icon: <Mail className="w-4 h-4" /> },
  { to: '/calendar', label: 'Calendario', icon: <Mail className="w-4 h-4" /> },
  { to: '/time-tracking', label: 'Time Tracking', icon: <Mail className="w-4 h-4" /> },
];

const adminNav = [
  { to: '/collaborators', label: 'Colaboradores', icon: <User className="w-4 h-4" /> },
  { to: '/users', label: 'Usuarios', icon: <User className="w-4 h-4" /> },
  { to: '/integrations', label: 'Integraciones', icon: <Mail className="w-4 h-4" /> },
];

export function MinimalSidebar() {
  const { role } = useUserRole();
  const isAdmin = role === 'admin' || role === 'superadmin';

  return (
    <aside className="w-60 bg-white border-r flex flex-col py-6 px-4">
      <div className="mb-8 font-bold text-xl text-gray-900">CRM</div>
      <nav className="flex-1 space-y-2">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
        
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administración
              </div>
            </div>
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}