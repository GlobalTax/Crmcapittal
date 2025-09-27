import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  ChevronDown, 
  User, 
  Palette, 
  Mail, 
  Settings, 
  Users, 
  Phone, 
  CreditCard, 
  Key, 
  Shield, 
  HelpCircle, 
  UserCheck, 
  Database, 
  Zap, 
  BarChart3, 
  Workflow,
  Building
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

interface SettingsItem {
  id: string;
  label: string;
  icon: any;
  path: string;
}

interface SettingsGroup {
  id: string;
  label: string;
  items: SettingsItem[];
  defaultOpen?: boolean;
}

const settingsGroups: SettingsGroup[] = [
  {
    id: 'account',
    label: 'Cuenta',
    defaultOpen: true,
    items: [
      { id: 'profile', label: 'Perfil', icon: User, path: '/settings/profile' },
      { id: 'appearance', label: 'Apariencia', icon: Palette, path: '/settings/appearance' },
      { id: 'email-calendar', label: 'Email y calendario', icon: Mail, path: '/settings/email-calendar' },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'general', label: 'General', icon: Settings, path: '/settings/general' },
      { id: 'members-teams', label: 'Miembros y equipos', icon: Users, path: '/settings/members-teams' },
      { id: 'call-intelligence', label: 'Inteligencia de llamadas', icon: Phone, path: '/settings/call-intelligence' },
      { id: 'plans', label: 'Planes', icon: Building, path: '/settings/plans' },
      { id: 'billing', label: 'Facturación', icon: CreditCard, path: '/settings/billing' },
      { id: 'developers', label: 'Desarrolladores', icon: Key, path: '/settings/developers' },
      { id: 'security', label: 'Seguridad', icon: Shield, path: '/settings/security' },
      { id: 'support', label: 'Solicitudes de soporte', icon: HelpCircle, path: '/settings/support' },
      { id: 'expert-access', label: 'Accesos expertos', icon: UserCheck, path: '/settings/expert-access' },
      { id: 'migrate-crm', label: 'Migrar CRM', icon: Database, path: '/settings/migrate-crm' },
      { id: 'apps', label: 'Aplicaciones', icon: Zap, path: '/settings/apps' },
    ],
  },
  {
    id: 'data',
    label: 'Datos',
    items: [
      { id: 'objects', label: 'Objetos', icon: Database, path: '/settings/objects' },
      { id: 'lists', label: 'Listas', icon: BarChart3, path: '/settings/lists' },
    ],
  },
  {
    id: 'reports',
    label: 'Informes',
    items: [
      { id: 'dashboards', label: 'Dashboards', icon: BarChart3, path: '/settings/dashboards' },
    ],
  },
  {
    id: 'automations',
    label: 'Automatizaciones',
    items: [
      { id: 'sequences', label: 'Secuencias', icon: Workflow, path: '/settings/sequences' },
      { id: 'workflows', label: 'Flujos de trabajo', icon: Workflow, path: '/settings/workflows' },
    ],
  },
];

export const SettingsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filter, setFilter } = useSettingsStore();
  const [openGroups, setOpenGroups] = useState<string[]>(['account']);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  // Filter items based on search
  const filteredGroups = settingsGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.label.toLowerCase().includes(filter.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleItemClick = (item: SettingsItem) => {
    navigate(item.path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-neutral-0">
      {/* Sidebar */}
      <div className="w-56 border-r border-border bg-neutral-0 flex flex-col">
        {/* Header with back button */}
        <div className="p-3 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
            className="w-full justify-start mb-3 text-muted-foreground hover:text-foreground"
          >
            ← Volver al Dashboard
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar configuración..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {filteredGroups.map((group) => (
              <Collapsible
                key={group.id}
                open={openGroups.includes(group.id) || filter.length > 0}
                onOpenChange={() => !filter && toggleGroup(group.id)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-neutral-100 transition-colors">
                  <span>{group.label}</span>
                  {!filter && (
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      openGroups.includes(group.id) && "rotate-180"
                    )} />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          "w-full justify-start px-6 py-2 h-auto text-sm font-normal",
                          isActive(item.path) && "bg-neutral-100 font-medium"
                        )}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto h-full">
        <div className="px-6 py-6 h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};