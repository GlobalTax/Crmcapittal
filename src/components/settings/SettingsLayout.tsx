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
    label: 'Account',
    defaultOpen: true,
    items: [
      { id: 'profile', label: 'Profile', icon: User, path: '/settings/profile' },
      { id: 'appearance', label: 'Appearance', icon: Palette, path: '/settings/appearance' },
      { id: 'email-calendar', label: 'Email & calendar accounts', icon: Mail, path: '/settings/email-calendar' },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'general', label: 'General', icon: Settings, path: '/settings/general' },
      { id: 'members-teams', label: 'Members & teams', icon: Users, path: '/settings/members-teams' },
      { id: 'call-recorder', label: 'Call recorder', icon: Phone, path: '/settings/call-recorder' },
      { id: 'plans', label: 'Plans', icon: Building, path: '/settings/plans' },
      { id: 'billing', label: 'Billing', icon: CreditCard, path: '/settings/billing' },
      { id: 'developers', label: 'Developers', icon: Key, path: '/settings/developers' },
      { id: 'security', label: 'Security', icon: Shield, path: '/settings/security' },
      { id: 'support', label: 'Support requests', icon: HelpCircle, path: '/settings/support' },
      { id: 'expert-access', label: 'Expert access grants', icon: UserCheck, path: '/settings/expert-access' },
      { id: 'migrate-crm', label: 'Migrate CRM', icon: Database, path: '/settings/migrate-crm' },
      { id: 'apps', label: 'Apps', icon: Zap, path: '/settings/apps' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    items: [
      { id: 'objects', label: 'Objects', icon: Database, path: '/settings/objects' },
      { id: 'lists', label: 'Lists', icon: BarChart3, path: '/settings/lists' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'dashboards', label: 'Dashboards', icon: BarChart3, path: '/settings/dashboards' },
    ],
  },
  {
    id: 'automations',
    label: 'Automations',
    items: [
      { id: 'sequences', label: 'Sequences', icon: Workflow, path: '/settings/sequences' },
      { id: 'workflows', label: 'Workflows', icon: Workflow, path: '/settings/workflows' },
    ],
  },
];

export const SettingsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filter, setFilter } = useSettingsStore();
  const [openGroups, setOpenGroups] = useState<string[]>(['account']);

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
      <div className="w-60 border-r border-border bg-neutral-0 flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search settings..."
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
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};