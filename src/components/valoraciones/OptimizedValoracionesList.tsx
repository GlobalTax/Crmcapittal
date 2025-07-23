
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  MoreHorizontal,
  Euro,
  Calendar,
  Building2,
  User
} from 'lucide-react';
import { useValoraciones } from '@/hooks/useValoraciones';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/utils/format';
import type { Database } from '@/integrations/supabase/types';

type Valoracion = Database['public']['Tables']['valoraciones']['Row'];

interface OptimizedValoracionesListProps {
  onView?: (valoracion: Valoracion) => void;
  onEdit?: (valoracion: Valoracion) => void;
}

export function OptimizedValoracionesList({ onView, onEdit }: OptimizedValoracionesListProps) {
  const navigate = useNavigate();
  const { valoraciones, loading } = useValoraciones();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredValoraciones = useMemo(() => {
    return valoraciones.filter(valoracion => {
      const matchesSearch = 
        valoracion.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        valoracion.client_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || valoracion.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || valoracion.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [valoraciones, searchTerm, statusFilter, priorityFilter]);

  const handleViewValoracion = (valoracion: Valoracion) => {
    navigate(`/valoraciones/${valoracion.id}`);
  };

  const handleEditValoracion = (valoracion: Valoracion) => {
    if (onEdit) {
      onEdit(valoracion);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-64 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="requested">Solicitada</SelectItem>
            <SelectItem value="in_process">En Proceso</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
            <SelectItem value="delivered">Entregada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las prioridades</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de valoraciones */}
      <div className="grid gap-4">
        {filteredValoraciones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron valoraciones</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay valoraciones creadas aún'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredValoraciones.map((valoracion) => {
            const phase = VALORACION_PHASES[valoracion.status];
            const daysSinceCreation = Math.floor((Date.now() - new Date(valoracion.created_at).getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <Card key={valoracion.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{valoracion.company_name}</CardTitle>
                        <Badge variant="outline" className={`${phase.bgColor} ${phase.textColor}`}>
                          {phase.icon} {phase.label}
                        </Badge>
                        {valoracion.priority && valoracion.priority !== 'medium' && (
                          <Badge variant={valoracion.priority === 'urgent' ? 'destructive' : 'secondary'}>
                            {valoracion.priority === 'urgent' ? 'Urgente' : 
                             valoracion.priority === 'high' ? 'Alta' : 'Baja'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{valoracion.client_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(valoracion.created_at), 'dd/MM/yyyy', { locale: es })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{daysSinceCreation} días</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewValoracion(valoracion)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditValoracion(valoracion)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {valoracion.fee_quoted ? formatCurrency(valoracion.fee_quoted) : 'Por definir'}
                        </p>
                        <p className="text-xs text-muted-foreground">Cotizado</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {valoracion.company_sector || 'Sin sector'}
                        </p>
                        <p className="text-xs text-muted-foreground">Sector</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {valoracion.assigned_to || 'Sin asignar'}
                        </p>
                        <p className="text-xs text-muted-foreground">Asignado</p>
                      </div>
                    </div>
                  </div>
                  
                  {valoracion.company_description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {valoracion.company_description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
