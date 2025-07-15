import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Clock, 
  Filter, 
  Copy, 
  Play, 
  Edit, 
  User, 
  Building2, 
  FileText,
  Calendar,
  Search,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TimeEntry } from '@/types/TimeTracking';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EnhancedTimeSheetProps {
  timeEntries: (TimeEntry & {
    planned_task?: {
      title: string;
    };
    lead?: {
      id: string;
      name: string;
      company_name?: string;
    };
    mandate?: {
      id: string;
      mandate_name: string;
      client_name: string;
    };
    contact?: {
      id: string;
      name: string;
    };
  })[];
  onDuplicateEntry: (entry: TimeEntry) => void;
  onContinueTask: (entry: TimeEntry) => void;
  onEditEntry: (entry: TimeEntry) => void;
}

export const EnhancedTimeSheet = ({ 
  timeEntries, 
  onDuplicateEntry, 
  onContinueTask, 
  onEditEntry 
}: EnhancedTimeSheetProps) => {
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [billableFilter, setBillableFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getActivityIcon = (activityType: string) => {
    const icons: Record<string, any> = {
      'meeting': User,
      'call': Clock,
      'development': Building2,
      'research': Search,
      'documentation': FileText,
      'general': Calendar,
    };
    const Icon = icons[activityType] || Clock;
    return <Icon className="h-4 w-4" />;
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
        color: 'bg-blue-100 text-blue-800'
      };
    }
    if (entry.mandate) {
      return {
        type: 'mandate',
        name: entry.mandate.mandate_name,
        subtitle: entry.mandate.client_name,
        id: entry.mandate.id,
        color: 'bg-green-100 text-green-800'
      };
    }
    if (entry.contact) {
      return {
        type: 'contact',
        name: entry.contact.name,
        subtitle: null,
        id: entry.contact.id,
        color: 'bg-purple-100 text-purple-800'
      };
    }
    return null;
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
      if (projectFilter !== 'all') {
        if (projectFilter === 'lead' && !entry.lead_id) return false;
        if (projectFilter === 'mandate' && !entry.mandate_id) return false;
        if (projectFilter === 'contact' && !entry.contact_id) return false;
        if (projectFilter === 'unassigned' && (entry.lead_id || entry.mandate_id || entry.contact_id)) return false;
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
    const sortedGroups = Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        date,
        entries: grouped[date].sort((a, b) => 
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        )
      }));

    return sortedGroups;
  }, [timeEntries, filter, typeFilter, billableFilter, projectFilter]);

  const filteredEntries = useMemo(() => {
    return groupedEntries.flatMap(group => group.entries);
  }, [groupedEntries]);

  const uniqueActivityTypes = [...new Set(timeEntries.map(e => e.activity_type))];
  const totalDuration = filteredEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
  const billableDuration = filteredEntries.filter(e => e.is_billable).reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);

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

  const TableView = () => (
    <div className="space-y-6">
      {groupedEntries.map((group) => {
        const dayTotal = group.entries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
        const dayBillable = group.entries.filter(e => e.is_billable).reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
        
        return (
          <div key={group.date} className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
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

            {/* Entries Table */}
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16">Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-48">Proyecto</TableHead>
                  <TableHead className="w-24">Inicio</TableHead>
                  <TableHead className="w-24">Fin</TableHead>
                  <TableHead className="w-20">Tiempo</TableHead>
                  <TableHead className="w-20">Estado</TableHead>
                  <TableHead className="w-16">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.entries.map((entry) => {
                  const projectInfo = getProjectInfo(entry);
                  return (
                    <TableRow key={entry.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActivityIcon(entry.activity_type)}
                          <Badge variant="outline" className="text-xs">
                            {getActivityTypeLabel(entry.activity_type)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm font-medium truncate">
                            {entry.planned_task?.title || entry.description || 'Sin descripción'}
                          </p>
                          {entry.planned_task?.title && entry.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {entry.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {projectInfo ? (
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${projectInfo.color}`}>
                              {projectInfo.type === 'lead' ? 'Lead' : 
                               projectInfo.type === 'mandate' ? 'Mandato' : 'Contacto'}
                            </Badge>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{projectInfo.name}</p>
                              {projectInfo.subtitle && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {projectInfo.subtitle}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => {
                                // Navigate to project details
                                const baseUrl = projectInfo.type === 'lead' ? '/leads' : 
                                               projectInfo.type === 'mandate' ? '/mandates' : '/contacts';
                                window.open(`${baseUrl}/${projectInfo.id}`, '_blank');
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Sin proyecto</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(entry.start_time), 'HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {entry.end_time ? format(new Date(entry.end_time), 'HH:mm', { locale: es }) : 'En curso'}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm font-medium">
                          {formatDuration(entry.duration_minutes || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={entry.is_billable ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {entry.is_billable ? 'Facturable' : 'No fact.'}
                        </Badge>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );

  const CardsView = () => (
    <div className="space-y-6">
      {groupedEntries.map((group) => {
        const dayTotal = group.entries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
        const dayBillable = group.entries.filter(e => e.is_billable).reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
        
        return (
          <div key={group.date} className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
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

            {/* Entries Cards */}
            <div className="grid gap-4">
              {group.entries.map((entry) => {
                const projectInfo = getProjectInfo(entry);
                return (
                  <Card key={entry.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {getActivityIcon(entry.activity_type)}
                            <Badge variant="outline" className="text-xs">
                              {getActivityTypeLabel(entry.activity_type)}
                            </Badge>
                            {projectInfo && (
                              <Badge className={`text-xs ${projectInfo.color}`}>
                                {projectInfo.type === 'lead' ? 'Lead' : 
                                 projectInfo.type === 'mandate' ? 'Mandato' : 'Contacto'}
                              </Badge>
                            )}
                            <Badge 
                              variant={entry.is_billable ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {entry.is_billable ? 'Facturable' : 'No fact.'}
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium text-sm mb-1">
                            {entry.planned_task?.title || entry.description || 'Sin descripción'}
                          </h4>
                          
                          {projectInfo && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {projectInfo.name} {projectInfo.subtitle && `- ${projectInfo.subtitle}`}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{format(new Date(entry.start_time), 'HH:mm', { locale: es })}</span>
                            <span>-</span>
                            <span>{entry.end_time ? format(new Date(entry.end_time), 'HH:mm', { locale: es }) : 'En curso'}</span>
                            <span className="font-mono font-medium">
                              {formatDuration(entry.duration_minutes || 0)}
                            </span>
                          </div>
                        </div>
                        
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
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registro de Tiempo
            <Badge variant="outline">{filteredEntries.length} entradas</Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Tabla
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              Tarjetas
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar entradas..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de actividad" />
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
            <SelectTrigger>
              <SelectValue placeholder="Facturable" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="billable">Facturable</SelectItem>
              <SelectItem value="non-billable">No facturable</SelectItem>
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Proyecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              <SelectItem value="lead">Leads</SelectItem>
              <SelectItem value="mandate">Mandatos</SelectItem>
              <SelectItem value="contact">Contactos</SelectItem>
              <SelectItem value="unassigned">Sin asignar</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setFilter('');
              setTypeFilter('all');
              setBillableFilter('all');
              setProjectFilter('all');
            }}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Limpiar
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Tiempo Total</p>
            <p className="font-mono font-semibold">{formatDuration(totalDuration)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Tiempo Facturable</p>
            <p className="font-mono font-semibold text-green-600">{formatDuration(billableDuration)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Tiempo No Facturable</p>
            <p className="font-mono font-semibold text-orange-600">{formatDuration(totalDuration - billableDuration)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredEntries.length > 0 ? (
          <div className="p-6">
            {viewMode === 'table' ? <TableView /> : <CardsView />}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No hay entradas de tiempo</p>
            <p className="text-muted-foreground">
              {filter || typeFilter !== 'all' || billableFilter !== 'all' || projectFilter !== 'all'
                ? 'No se encontraron entradas que coincidan con los filtros'
                : 'Comienza a registrar tu tiempo para ver las entradas aquí'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};