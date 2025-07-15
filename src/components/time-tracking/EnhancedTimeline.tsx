import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Filter,
  MoreHorizontal,
  Play,
  Copy,
  Edit,
  ExternalLink,
  Search,
  User,
  Building2,
  FileText,
  Phone
} from 'lucide-react';
import { TimeEntry } from '@/types/TimeTracking';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EnhancedTimelineProps {
  timeEntries: (TimeEntry & {
    planned_task?: { title: string };
    lead?: { id: string; name: string; company_name?: string };
    mandate?: { id: string; mandate_name: string; client_name: string };
    contact?: { id: string; name: string };
  })[];
  onDuplicateEntry: (entry: TimeEntry) => void;
  onContinueTask: (entry: TimeEntry) => void;
  onEditEntry: (entry: TimeEntry) => void;
}

export const EnhancedTimeline = ({
  timeEntries,
  onDuplicateEntry,
  onContinueTask,
  onEditEntry
}: EnhancedTimelineProps) => {
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [billableFilter, setBillableFilter] = useState('all');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const getActivityIcon = (activityType: string) => {
    const icons: Record<string, any> = {
      'meeting': User,
      'call': Phone,
      'development': Building2,
      'research': Search,
      'documentation': FileText,
      'general': Calendar,
    };
    return icons[activityType] || Clock;
  };

  const getActivityTypeLabel = (activityType: string) => {
    const labels: Record<string, string> = {
      'meeting': 'Reunión',
      'call': 'Llamada',
      'development': 'Desarrollo',
      'research': 'Investigación',
      'documentation': 'Documentación',
      'general': 'General',
    };
    return labels[activityType] || activityType;
  };

  const getProjectInfo = (entry: TimeEntry & { lead?: any; mandate?: any; contact?: any }) => {
    if (entry.lead) {
      return {
        type: 'lead',
        name: entry.lead.name,
        subtitle: entry.lead.company_name,
        id: entry.lead.id,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      };
    }
    if (entry.mandate) {
      return {
        type: 'mandate',
        name: entry.mandate.mandate_name,
        subtitle: entry.mandate.client_name,
        id: entry.mandate.id,
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      };
    }
    if (entry.contact) {
      return {
        type: 'contact',
        name: entry.contact.name,
        subtitle: null,
        id: entry.contact.id,
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      };
    }
    return null;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const groupedEntries = useMemo(() => {
    const filtered = timeEntries.filter(entry => {
      const projectInfo = getProjectInfo(entry);
      const searchText = `${entry.description || ''} ${entry.activity_type} ${projectInfo?.name || ''}`.toLowerCase();
      
      if (filter && !searchText.includes(filter.toLowerCase())) return false;
      if (typeFilter !== 'all' && entry.activity_type !== typeFilter) return false;
      if (billableFilter !== 'all') {
        if (billableFilter === 'billable' && !entry.is_billable) return false;
        if (billableFilter === 'non-billable' && entry.is_billable) return false;
      }
      
      return true;
    });

    // Group entries by date
    const grouped = filtered.reduce((acc, entry) => {
      const date = format(new Date(entry.start_time), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, typeof filtered>);

    // Sort dates in descending order and sort entries within each date
    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        date,
        entries: grouped[date].sort((a, b) => 
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        )
      }));
  }, [timeEntries, filter, typeFilter, billableFilter]);

  const uniqueActivityTypes = [...new Set(timeEntries.map(e => e.activity_type))];

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Hoy';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Ayer';
    } else {
      return format(date, "EEEE, d 'de' MMMM", { locale: es });
    }
  };

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en descripción, tipo o proyecto..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {uniqueActivityTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {getActivityTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={billableFilter} onValueChange={setBillableFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Facturación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="billable">Facturable</SelectItem>
                <SelectItem value="non-billable">No facturable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {groupedEntries.map((group) => {
          const dayTotal = group.entries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
          const dayBillable = group.entries.filter(e => e.is_billable).reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
          const isExpanded = expandedDays.has(group.date);
          
          return (
            <Collapsible key={group.date} open={isExpanded} onOpenChange={() => toggleDay(group.date)}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold text-lg">{getDateLabel(group.date)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(group.date), "dd/MM/yyyy")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-mono font-semibold">{formatDuration(dayTotal)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Facturable</p>
                          <p className="font-mono font-semibold text-green-600">{formatDuration(dayBillable)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Entradas</p>
                          <p className="font-semibold">{group.entries.length}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    {group.entries.map((entry, index) => {
                      const projectInfo = getProjectInfo(entry);
                      const Icon = getActivityIcon(entry.activity_type);
                      
                      return (
                        <div key={entry.id} className="relative">
                          {/* Timeline line */}
                          {index < group.entries.length - 1 && (
                            <div className="absolute left-6 top-12 w-0.5 h-8 bg-border" />
                          )}
                          
                          <div className="flex gap-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors">
                            {/* Icon and time */}
                            <div className="flex flex-col items-center gap-1 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-xs text-muted-foreground text-center">
                                {format(new Date(entry.start_time), 'HH:mm', { locale: es })}
                              </div>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="min-w-0">
                                  <h4 className="font-medium text-sm mb-1">
                                    {entry.planned_task?.title || entry.description || 'Sin descripción'}
                                  </h4>
                                  {entry.planned_task?.title && entry.description && (
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {entry.description}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-medium">
                                    {formatDuration(entry.duration_minutes || 0)}
                                  </span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => onDuplicateEntry(entry)}>
                                        <Copy className="h-3 w-3 mr-2" />
                                        Duplicar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => onContinueTask(entry)}>
                                        <Play className="h-3 w-3 mr-2" />
                                        Continuar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => onEditEntry(entry)}>
                                        <Edit className="h-3 w-3 mr-2" />
                                        Editar
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {getActivityTypeLabel(entry.activity_type)}
                                </Badge>
                                
                                <Badge 
                                  variant={entry.is_billable ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {entry.is_billable ? 'Facturable' : 'No fact.'}
                                </Badge>
                                
                                {projectInfo && (
                                  <div className="flex items-center gap-1">
                                    <Badge className={`text-xs ${projectInfo.color}`}>
                                      {projectInfo.type === 'lead' ? 'Lead' : 
                                       projectInfo.type === 'mandate' ? 'Mandato' : 'Contacto'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{projectInfo.name}</span>
                                    {projectInfo.subtitle && (
                                      <span className="text-xs text-muted-foreground">- {projectInfo.subtitle}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
        
        {groupedEntries.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No hay entradas de tiempo</p>
              <p className="text-sm text-muted-foreground">
                {filter || typeFilter !== 'all' || billableFilter !== 'all' 
                  ? 'No se encontraron entradas con los filtros aplicados' 
                  : 'Comienza a trackear tu tiempo para ver el timeline'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};