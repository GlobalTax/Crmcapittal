import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Building, 
  User, 
  Target, 
  Euro, 
  MapPin, 
  Clock, 
  Eye, 
  Edit,
  MoreHorizontal,
  TrendingUp
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatInvestmentRange } from '@/utils/reconversionPhases';
import { ReconversionStatusBadge } from './ReconversionStatusBadge';
import type { Reconversion } from '@/types/Reconversion';

interface OptimizedReconversionCardProps {
  reconversion: Reconversion;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStartMatching?: () => void;
  className?: string;
}

export function OptimizedReconversionCard({ 
  reconversion, 
  onView,
  onEdit,
  onDelete,
  onStartMatching,
  className 
}: OptimizedReconversionCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: es 
    }).replace('hace ', '');
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 border-2 border-muted">
              <AvatarFallback className="text-xs font-medium">
                {getInitials(reconversion.company_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {reconversion.company_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <User className="h-3 w-3" />
                <span className="truncate">{reconversion.contact_name}</span>
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <ReconversionStatusBadge 
              status={reconversion.status} 
              priority={reconversion.priority}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={onView}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalles
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onStartMatching && reconversion.status === 'active' && (
                  <DropdownMenuItem onClick={onStartMatching}>
                    <Target className="h-4 w-4 mr-2" />
                    Iniciar matching
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Investment Range */}
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {formatInvestmentRange(
              reconversion.investment_capacity_min, 
              reconversion.investment_capacity_max
            )}
          </span>
        </div>

        {/* Target Sectors */}
        {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sectores:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {reconversion.target_sectors.slice(0, 3).map((sector, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-1"
                >
                  {sector}
                </Badge>
              ))}
              {reconversion.target_sectors.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{reconversion.target_sectors.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Geographic Preferences */}
        {reconversion.geographic_preferences && reconversion.geographic_preferences.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {reconversion.geographic_preferences.slice(0, 2).join(', ')}
              {reconversion.geographic_preferences.length > 2 && '...'}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>hace {formatTimeAgo(reconversion.created_at)}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onView && (
              <Button variant="ghost" size="sm" onClick={onView}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}