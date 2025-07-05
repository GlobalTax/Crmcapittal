import React from 'react';
import { DashboardCard } from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Euro, Clock, User } from 'lucide-react';
import { Operation } from '@/types/Operation';
import { Negocio } from '@/types/Negocio';
import { UserRole } from '@/hooks/useUserRole';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecentDealsProps {
  operations: Operation[];
  negocios: Negocio[];
  role: UserRole;
}

export const RecentDeals = ({ operations, negocios, role }: RecentDealsProps) => {
  // Combine and sort recent deals
  const recentDeals = React.useMemo(() => {
    const deals = [];
    
    // Add operations
    operations.forEach(op => {
      deals.push({
        id: op.id,
        type: 'operation',
        title: op.company_name || 'Operación sin nombre',
        value: op.amount,
        status: op.status,
        manager: op.manager?.name,
        date: new Date(op.created_at || Date.now()),
        location: op.location,
        currency: 'EUR'
      });
    });

    // Add negocios
    negocios.forEach(neg => {
      deals.push({
        id: neg.id,
        type: 'negocio',
        title: neg.nombre_negocio,
        value: neg.valor_negocio,
        status: neg.stage?.name || 'Sin etapa',
        manager: neg.propietario_negocio,
        date: new Date(neg.updated_at || Date.now()),
        location: neg.ubicacion,
        currency: neg.moneda || 'EUR'
      });
    });

    return deals
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 6);
  }, [operations, negocios]);

  const formatCurrency = (value: number | null | undefined, currency = 'EUR') => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: value > 999999 ? 'compact' : 'standard'
    }).format(value);
  };

  const getStatusColor = (status: string, type: string) => {
    if (type === 'operation') {
      switch (status) {
        case 'available': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'in_process': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'sold': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getStatusLabel = (status: string, type: string) => {
    if (type === 'operation') {
      switch (status) {
        case 'available': return 'Disponible';
        case 'in_process': return 'En Proceso';
        case 'sold': return 'Vendida';
        default: return status;
      }
    }
    return status;
  };

  return (
    <DashboardCard title="Deals Recientes" icon={Building2}>
        {recentDeals.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No hay deals recientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentDeals.map((deal) => (
              <div 
                key={`${deal.type}-${deal.id}`}
                className="group p-4 rounded-xl border border-border hover:border-primary/20 hover:bg-accent/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {deal.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(deal.status, deal.type)}`}
                      >
                        {getStatusLabel(deal.status, deal.type)}
                      </Badge>
                      {deal.type === 'operation' && (
                        <Badge variant="outline" className="text-xs">
                          M&A
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center text-success font-bold">
                      <Euro className="h-4 w-4 mr-1" />
                      {formatCurrency(deal.value, deal.currency)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    {deal.manager && (
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {deal.manager.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <User className="h-3 w-3 mr-1" />
                        {deal.manager}
                      </div>
                    )}
                    
                    {deal.location && (
                      <div className="flex items-center">
                        <span>📍 {deal.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(deal.date, { addSuffix: true, locale: es })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {recentDeals.length > 0 && (role === 'admin' || role === 'superadmin') && (
          <div className="mt-6 pt-4 border-t border-border">
            <button className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium py-2 px-4 rounded-lg hover:bg-accent transition-colors">
              Ver todos los deals →
            </button>
          </div>
        )}
    </DashboardCard>
  );
};