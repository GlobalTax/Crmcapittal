import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MapPin, TrendingUp, User, Building, Target, Users } from 'lucide-react';
import { ReconversionStatusBadge } from './ReconversionStatusBadge';
import { formatCurrency, formatInvestmentRange } from '@/utils/reconversionPhases';
import { Reconversion } from '@/types/Reconversion';

interface OptimizedReconversionCardProps {
  reconversion: Reconversion;
  onSelect?: () => void;
  className?: string;
}

export function OptimizedReconversionCard({ 
  reconversion, 
  onSelect,
  className = ''
}: OptimizedReconversionCardProps) {
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'border-l-emerald-500 bg-emerald-50/50';
      case 'matching':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'paused':
        return 'border-l-amber-500 bg-amber-50/50';
      case 'closed':
        return 'border-l-gray-500 bg-gray-50/50';
      default:
        return 'border-l-gray-300 bg-gray-50/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'critica':
        return 'bg-red-500 text-white';
      case 'high':
      case 'alta':
        return 'bg-orange-500 text-white';
      case 'medium':
      case 'media':
        return 'bg-blue-500 text-white';
      case 'low':
      case 'baja':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <Card 
      className={`relative overflow-hidden border-l-4 ${getStatusColor(reconversion.status)} hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] group cursor-pointer ${className}`}
      onClick={onSelect}
    >
      {/* Status indicator dot */}
      <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${getStatusColor(reconversion.status)} pulse`} />
      
      {/* Gradient overlay for visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/40 transition-colors shadow-sm">
                <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/10 to-primary/20 text-primary">
                  {getInitials(reconversion.company_name)}
                </AvatarFallback>
              </Avatar>
              {/* Priority indicator - simplified to always show medium for now */}
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getPriorityColor('medium')} flex items-center justify-center`}>
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {reconversion.company_name}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{reconversion.contact_name}</span>
              </div>
              
              {/* Email if available */}
              {reconversion.contact_email && (
                <div className="text-xs text-muted-foreground truncate">
                  {reconversion.contact_email}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <ReconversionStatusBadge 
              status={reconversion.status} 
              priority="medium"
            />
            {reconversion.conversion_probability && (
              <Badge variant="outline" className="text-xs">
                {reconversion.conversion_probability}% prob.
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 relative z-10">
        {/* Investment capacity range */}
        {(reconversion.investment_capacity_min || reconversion.investment_capacity_max) && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="text-muted-foreground">Inversión:</span>
            <span className="font-semibold text-emerald-700">
              {formatInvestmentRange(reconversion.investment_capacity_min, reconversion.investment_capacity_max)}
            </span>
          </div>
        )}

        {/* Revenue range */}
        {(reconversion.min_revenue || reconversion.max_revenue) && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-muted-foreground">Facturación:</span>
            <span className="font-semibold text-blue-700">
              {formatInvestmentRange(reconversion.min_revenue, reconversion.max_revenue)}
            </span>
          </div>
        )}

        {/* Target sectors */}
        {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Target className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-muted-foreground text-xs block mb-1">Sectores objetivo:</span>
              <div className="flex flex-wrap gap-1">
                {reconversion.target_sectors.slice(0, 2).map((sector, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                    {sector}
                  </Badge>
                ))}
                {reconversion.target_sectors.length > 2 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{reconversion.target_sectors.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Target locations */}
        {reconversion.target_locations && reconversion.target_locations.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-orange-600 flex-shrink-0" />
            <span className="text-muted-foreground">Ubicación:</span>
            <span className="font-medium text-orange-700 truncate">
              {reconversion.target_locations.slice(0, 2).join(', ')}
              {reconversion.target_locations.length > 2 && '...'}
            </span>
          </div>
        )}

        {/* Timeline */}
        {reconversion.timeline_preference && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-indigo-600 flex-shrink-0" />
            <span className="text-muted-foreground">Timeline:</span>
            <span className="font-medium text-indigo-700">{reconversion.timeline_preference}</span>
          </div>
        )}

        {/* Rejection reason preview */}
        {reconversion.rejection_reason && (
          <div className="text-xs">
            <p className="text-muted-foreground mb-1">Motivo rechazo original:</p>
            <p className="text-foreground bg-muted/30 p-2 rounded text-xs line-clamp-2 leading-relaxed">
              {reconversion.rejection_reason}
            </p>
          </div>
        )}

        {/* Dates footer */}
        <div className="flex justify-between items-center pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Creado: {formatDate(reconversion.created_at)}</span>
          </div>
          {reconversion.next_contact_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Próximo: {formatDate(reconversion.next_contact_date)}</span>
            </div>
          )}
        </div>

        {/* Assigned user indicator */}
        {reconversion.assigned_to && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <Users className="h-3 w-3" />
            <span>Asignado a usuario</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}