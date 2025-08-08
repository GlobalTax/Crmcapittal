import { NavLink, useLocation } from 'react-router-dom';
import { prefetchRoute, prefetchIdle } from '@/utils/prefetchRoutes';
import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useLeads } from '@/hooks/useLeads';

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
    title: "Ventas & Transacciones",
    items: [
      { to: '/transacciones', label: 'Mandatos de Venta', icon: Briefcase },
      { to: '/buying-mandates', label: 'Mandatos de Compra', icon: FileText },
      { to: '/valoraciones', label: 'Valoraciones', icon: Calculator },
      { to: '/reconversiones', label: 'Reconversiones', icon: RefreshCw },
      { to: '/proposals', label: 'Propuestas', icon: FileText },
      { to: '/documents', label: 'Documentos', icon: FileText },
    ]
  },
  {
    title: "Comunicación",
    items: [
      { to: '/email', label: 'Email', icon: Mail },
      { to: '/calendar', label: 'Calendario', icon: Calendar },
      { to: '/tiempo', label: 'Control de Tiempo', icon: Clock },
    ]
  },
  {
    title: "Análisis & Data",
    items: [
      { to: '/hubspot-data', label: 'Base de Datos HubSpot', icon: Database },
      { to: '/einforma', label: 'eInforma Dashboard', icon: Database },
    ]
  },
  {
    title: "ROD Builder",
    items: [
      { to: '/rod', label: 'Crear ROD', icon: Target },
      { to: '/subscribers', label: 'Gestionar Suscriptores', icon: Users2 },
      { to: '/campaigns', label: 'Campañas de Email', icon: Send },
    ]
  }
];

const getAdminSection = (isSuperAdmin: boolean): NavSection => ({
  title: "Administración",
  items: [
    { to: '/collaborators', label: 'Colaboradores', icon: UserPlus },
    { to: '/users', label: 'Gestión de Usuarios', icon: Users },
    ...(isSuperAdmin ? [{ to: '/comisiones', label: 'Comisiones', icon: DollarSign }] : []),
    { to: '/integrations', label: 'Integraciones', icon: Zap },
  ]
});

const getPrincipalSection = (isSuperAdmin: boolean): NavSection => ({
  title: "Principal",
  items: [
    { to: '/personal', label: 'Dashboard Personal', icon: LayoutDashboard },
    { to: '/', label: 'Control Leads', icon: LayoutDashboard },
    ...(isSuperAdmin ? [{ to: '/asignaciones', label: 'Control de Asignaciones', icon: Users2 }] : []),
    { to: '/gestion-leads', label: 'Gestión de Leads', icon: TrendingUp },
    { to: '/contactos', label: 'Contactos', icon: Users },
    { to: '/empresas', label: 'Empresas', icon: Building2 },
  ]
});

export function AttioSidebar() {
  const location = useLocation();
  
  const { role } = useUserRole();
  
  const { leads } = useLeads();

  // Prefetch some critical routes on idle
  React.useEffect(() => {
    prefetchIdle();
  }, []);
  
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isSuperAdmin = role === 'superadmin';

  // Count new leads that need attention
  const newLeadsCount = leads.filter(lead => lead.status === 'NEW').length;
  const todayLeadsCount = leads.filter(lead => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(lead.created_at) >= today;
  }).length;

  const allSections = [getPrincipalSection(isSuperAdmin), ...navigationSections, ...(isAdmin ? [getAdminSection(isSuperAdmin)] : [])];

  return (
    <aside className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col" style={{ backgroundColor: '#FBFBFB' }}>
      {/* Brand Section */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-sidebar-primary rounded flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-semibold text-xs">C</span>
          </div>
          <div>
            <h1 className="font-medium text-sidebar-accent-foreground text-sm">CRM Pro</h1>
            <p className="text-xs text-sidebar-foreground">M&A Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {allSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-normal text-sidebar-foreground uppercase tracking-wide mb-2 px-2">
              {section.title}
            </h2>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;
                
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onMouseEnter={() => prefetchRoute(item.to)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-2 py-1.5 rounded text-sm font-normal transition-colors duration-150 ${
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`
                      }
                     >
                       <Icon className="w-4 h-4 flex-shrink-0" />
                       <span className="truncate">{item.label}</span>
                       {/* Show leads counter for Control Leads */}
                       {item.to === '/' && (newLeadsCount > 0 || todayLeadsCount > 0) && (
                         <div className="ml-auto flex gap-1">
                           {newLeadsCount > 0 && (
                             <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                               {newLeadsCount}
                             </span>
                           )}
                           {todayLeadsCount > 0 && newLeadsCount !== todayLeadsCount && (
                             <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                               {todayLeadsCount}
                             </span>
                           )}
                         </div>
                       )}
                     </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer with user info or additional actions */}
      <div className="p-3 border-t border-sidebar-border">
        <NavLink 
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-sm font-normal ${
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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