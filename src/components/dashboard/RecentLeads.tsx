import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Badge } from '@/components/ui/minimal/Badge';
import { Button } from '@/components/ui/minimal/Button';
import { User, Phone, Mail } from 'lucide-react';

// Mock data
const recentLeads = [
  {
    id: '1',
    name: 'TechStart Solutions',
    contact: 'María González',
    value: 125000,
    stage: 'Cualificado',
    lastActivity: '2 horas',
    priority: 'high'
  },
  {
    id: '2',
    name: 'Inversiones Mediterráneo',
    contact: 'Carlos Ruiz',
    value: 85000,
    stage: 'Propuesta',
    lastActivity: '1 día',
    priority: 'medium'
  },
  {
    id: '3',
    name: 'Global Ventures Ltd',
    contact: 'Ana Martín',
    value: 200000,
    stage: 'Negociación',
    lastActivity: '3 horas',
    priority: 'high'
  },
  {
    id: '4',
    name: 'StartUp Innovación',
    contact: 'Pedro López',
    value: 65000,
    stage: 'Prospecto',
    lastActivity: '5 horas',
    priority: 'low'
  },
  {
    id: '5',
    name: 'Capital Risk Fund',
    contact: 'Laura Sánchez',
    value: 340000,
    stage: 'Due Diligence',
    lastActivity: '2 días',
    priority: 'high'
  }
];

export const RecentLeads = () => {
  return (
    <DashboardCard title="Leads Recientes" icon={User}>
      <div className="space-y-4">
        {recentLeads.map((lead) => (
          <div key={lead.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">
                {lead.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                {lead.contact} • €{(lead.value / 1000).toFixed(0)}K
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  color={lead.priority === 'high' ? 'red' : lead.priority === 'medium' ? 'yellow' : 'gray'}
                >
                  {lead.stage}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Hace {lead.lastActivity}
                </span>
              </div>
            </div>
            <div className="flex gap-1 ml-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm">
                <Mail className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};