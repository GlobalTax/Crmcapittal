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
      case 'urgent': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default: return 'text-muted-foreground bg-muted/50 border-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      case 'converted': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className={`relative overflow-hidden border-l-4 ${getStatusColor(reconversion.status)} hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] group cursor-pointer ${className}`}>
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
              {/* Priority indicator */}
              {reconversion.priority && reconversion.priority !== 'low' && (
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getPriorityColor(reconversion.priority)} flex items-center justify-center`}>
                  <div className="w-2 h-2 rounded-full bg-current" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                {reconversion.company_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <User className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{reconversion.contact_name}</span>
              </CardDescription>
              
              {/* Quick stats */}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(reconversion.created_at)}</span>
                </div>
                {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    <span>{reconversion.target_sectors.length} sectores</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <ReconversionStatusBadge 
              status={reconversion.status} 
              priority={reconversion.priority}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onView && (
                  <DropdownMenuItem onClick={onView} className="cursor-pointer">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalles
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onStartMatching && reconversion.status === 'active' && (
                  <DropdownMenuItem onClick={onStartMatching} className="cursor-pointer">
                    <Target className="h-4 w-4 mr-2" />
                    Iniciar matching
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Investment Range - Enhanced visual */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 group-hover:border-primary/30 transition-colors">
          <div className="p-2 bg-primary/20 rounded-full">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground block">
              {formatInvestmentRange(
                reconversion.investment_capacity_min, 
                reconversion.investment_capacity_max
              )}
            </span>
            <span className="text-xs text-muted-foreground">Capacidad de inversión</span>
          </div>
        </div>

        {/* Target Sectors - Enhanced visual */}
        {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-secondary rounded-full">
                <Target className="h-3 w-3 text-secondary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">Sectores objetivo</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {reconversion.target_sectors.slice(0, 3).map((sector, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2.5 py-1 hover:bg-secondary/80 transition-colors cursor-default"
                >
                  {sector}
                </Badge>
              ))}
              {reconversion.target_sectors.length > 3 && (
                <Badge variant="outline" className="text-xs px-2.5 py-1 bg-muted/30 hover:bg-muted/50 transition-colors cursor-default">
                  +{reconversion.target_sectors.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Geographic Preferences - Enhanced visual */}
        {reconversion.geographic_preferences && reconversion.geographic_preferences.length > 0 && (
          <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
            <div className="p-1.5 bg-accent rounded-full">
              <MapPin className="h-3 w-3 text-accent-foreground" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground block">
                {reconversion.geographic_preferences.slice(0, 2).join(', ')}
                {reconversion.geographic_preferences.length > 2 && '...'}
              </span>
              <span className="text-xs text-muted-foreground">Preferencias geográficas</span>
            </div>
          </div>
        )}

        {/* Enhanced Footer with Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-muted/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Creado {formatTimeAgo(reconversion.created_at)}</span>
          </div>

          {/* Quick action buttons - Always visible on larger screens, hover on mobile */}
          <div className="flex items-center gap-1 sm:opacity-100 opacity-0 group-hover:opacity-100 transition-all duration-200">
            {onView && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                title="Ver detalles"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="h-8 w-8 p-0 hover:bg-secondary/60 hover:text-secondary-foreground transition-all duration-200"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onStartMatching && reconversion.status === 'active' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onStartMatching();
                }}
                className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                title="Iniciar matching"
              >
                <Target className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}