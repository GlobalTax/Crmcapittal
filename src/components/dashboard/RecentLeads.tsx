import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Badge } from '@/components/ui/minimal/Badge';
import { Button } from '@/components/ui/minimal/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLeads } from '@/hooks/useLeads';
import { User, Phone, Mail, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NEW': return 'red';
    case 'CONTACTED': return 'yellow';
    case 'QUALIFIED': return 'green';
    case 'DISQUALIFIED': return 'gray';
    default: return 'blue';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'NEW': return 'Nuevo';
    case 'CONTACTED': return 'Contactado';
    case 'QUALIFIED': return 'Cualificado';
    case 'DISQUALIFIED': return 'Descalificado';
    default: return status;
  }
};

export const RecentLeads = () => {
  const { leads, isLoading } = useLeads();
  
  // Get the most recent leads (max 5)
  const recentLeads = leads
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Count NEW leads created today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newLeadsToday = leads.filter(lead => 
    lead.status === 'NEW' && new Date(lead.created_at) >= today
  ).length;

  if (isLoading) {
    return (
      <DashboardCard title="Leads Recientes" icon={User}>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-accent rounded-lg"></div>
            </div>
          ))}
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Leads Recientes" icon={User}>
      <div className="space-y-4">
        {/* New leads today alert */}
        {newLeadsToday > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                {newLeadsToday} leads nuevos hoy - ¡Requieren atención!
              </span>
            </div>
          </div>
        )}
        
        {recentLeads.length === 0 ? (
          <EmptyState
            icon={User}
            title="No hay leads recientes"
            subtitle="Los nuevos leads aparecerán aquí"
          />
        ) : (
          recentLeads.map((lead) => (
            <div 
              key={lead.id} 
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                lead.status === 'NEW' ? 'bg-red-50 border-l-4 border-l-red-500' : 'bg-accent'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {lead.name}
                  </h4>
                  {lead.status === 'NEW' && (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {lead.company_name && `${lead.company_name} • `}
                  {lead.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge color={getStatusColor(lead.status)}>
                    {getStatusLabel(lead.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(lead.created_at), { 
                      addSuffix: true, 
                      locale: es 
                    })}
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
          ))
        )}
      </div>
    </DashboardCard>
  );
};