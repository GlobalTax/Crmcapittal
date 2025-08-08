import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { useUnifiedTimeline, formatDayGroupHeader } from '@/hooks/useUnifiedTimeline';
import { ActivityEntityType, UnifiedTimelineFilters } from '@/types/UnifiedActivity';
import { getActivityColor } from '@/utils/activityTransformers';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface UnifiedTimelineProps {
  entityType: ActivityEntityType;
  entityId: string;
  title?: string;
  showFilters?: boolean;
  showExport?: boolean;
  maxHeight?: string;
}

interface TimelineDayGroupProps {
  date: string;
  activities: any[];
  isExpanded: boolean;
  onToggle: () => void;
}

const TimelineDayGroup = ({ date, activities, isExpanded, onToggle }: TimelineDayGroupProps) => {
  return (
    <div className="space-y-2">
      {/* Day Header */}
      <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">
            {formatDayGroupHeader(date)}
          </span>
          <Badge variant="outline" className="text-xs">
            {activities.length} actividad{activities.length !== 1 ? 'es' : ''}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Activities */}
      {isExpanded && (
        <div className="space-y-3 ml-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {/* Timeline connector */}
              {index < activities.length - 1 && (
                <div className="absolute left-4 top-12 w-0.5 h-8 bg-border" />
              )}
              
              <div className="flex items-start gap-3">
                {/* Activity Icon */}
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full text-sm bg-background border-2"
                  style={{ borderColor: getActivityColor(activity.type, activity.activity_subtype) }}
                >
                  <span className="text-xs">{activity.icon}</span>
                </div>
                
                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {activity.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                      )}
                      
                      {/* Metadata */}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {Object.entries(activity.metadata).slice(0, 3).map(([key, value]) => {
                            if (key === 'original_data' || !value) return null;
                            return (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {String(value).slice(0, 20)}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* User and timestamp */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {activity.user_name && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{activity.user_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(parseISO(activity.timestamp), 'HH:mm', { locale: es })}
                          </span>
                        </div>
                        {activity.severity && activity.severity !== 'medium' && (
                          <Badge 
                            variant={activity.severity === 'critical' ? 'destructive' : 'secondary'} 
                            className="text-xs"
                          >
                            {activity.severity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function UnifiedTimeline({ 
  entityType, 
  entityId, 
  title = "Timeline de Actividad",
  showFilters = true,
  showExport = true,
  maxHeight = "600px"
}: UnifiedTimelineProps) {
  const [filters, setFilters] = useState<UnifiedTimelineFilters>({});
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const { dayGroups, isLoading, error, totalCount } = useUnifiedTimeline({
    entityType,
    entityId,
    filters: {
      ...filters,
      search: searchTerm || undefined
    }
  });

  // Toggle day expansion
  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  // Expand all days by default if there are few activities
  React.useEffect(() => {
    if (dayGroups.length > 0 && expandedDays.size === 0) {
      const allDates = dayGroups.slice(0, 3).map(group => group.date); // Expand first 3 days
      setExpandedDays(new Set(allDates));
    }
  }, [dayGroups]);

  const handleExport = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text('Timeline de Actividad', 20, 30);
      
      doc.setFontSize(12);
      doc.text(`Entidad: ${entityType} (${entityId})`, 20, 45);
      doc.text(`Fecha de Generación: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, 55);

      let yPosition = 75;

      dayGroups.forEach((dayGroup) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text(formatDayGroupHeader(dayGroup.date), 20, yPosition);
        yPosition += 10;

        dayGroup.activities.forEach((activity, index) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(10);
          doc.text(`${activity.icon} ${activity.title}`, 25, yPosition);
          yPosition += 5;
          
          if (activity.description) {
            doc.setFontSize(8);
            const lines = doc.splitTextToSize(activity.description, 150);
            doc.text(lines, 30, yPosition);
            yPosition += lines.length * 4;
          }
          
          yPosition += 3;
        });
        
        yPosition += 5;
      });

      doc.save(`timeline-${entityType}-${entityId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error al cargar el timeline</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {title}
            {totalCount > 0 && (
              <Badge variant="outline" className="ml-2">
                {totalCount} actividad{totalCount !== 1 ? 'es' : ''}
              </Badge>
            )}
          </CardTitle>
          
          {showExport && totalCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar actividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.type?.[0] || 'all'} onValueChange={(value) => {
              if (value === 'all') {
                setFilters({ ...filters, type: undefined });
              } else {
                setFilters({ ...filters, type: [value as any] });
              }
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {filters.type?.[0] ? filters.type[0].replace('_', ' ') : 'Todos los tipos'}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="lead_interaction">Interacciones Lead</SelectItem>
                <SelectItem value="mandate_activity">Actividades Mandato</SelectItem>
                <SelectItem value="reconversion_audit">Auditoría Reconversión</SelectItem>
                <SelectItem value="valoracion_security">Seguridad Valoración</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className={cn("pr-4")} style={{ height: maxHeight }}>
          {dayGroups.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No hay actividades</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm 
                  ? "No se encontraron actividades con esos criterios" 
                  : "Las actividades aparecerán aquí cuando se generen"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayGroups.map((dayGroup, index) => (
                <div key={dayGroup.date}>
                  <TimelineDayGroup
                    date={dayGroup.date}
                    activities={dayGroup.activities}
                    isExpanded={expandedDays.has(dayGroup.date)}
                    onToggle={() => toggleDay(dayGroup.date)}
                  />
                  {index < dayGroups.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}