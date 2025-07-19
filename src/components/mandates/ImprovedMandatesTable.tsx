
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Eye, 
  Users, 
  Calendar, 
  MapPin, 
  Building2,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ImprovedMandatesTableProps {
  mandates: BuyingMandate[];
  onRefresh: () => void;
}

export const ImprovedMandatesTable = ({ mandates, onRefresh }: ImprovedMandatesTableProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'client'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: 'Activo',
      paused: 'Pausado',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return texts[status as keyof typeof texts] || status;
  };

  // Filter and sort mandates
  const filteredMandates = mandates
    .filter(mandate => {
      const matchesSearch = 
        mandate.mandate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mandate.client_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || mandate.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;
      
      switch (sortBy) {
        case 'name':
          aValue = a.mandate_name;
          bValue = b.mandate_name;
          break;
        case 'client':
          aValue = a.client_name;
          bValue = b.client_name;
          break;
        case 'date':
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: 'name' | 'date' | 'client') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleViewDetail = (mandateId: string) => {
    navigate(`/buying-mandates/${mandateId}`);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre de mandato o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="paused">Pausados</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando {filteredMandates.length} de {mandates.length} mandatos
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('name')}
                    className="font-semibold hover:bg-transparent p-0"
                  >
                    Mandato
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('client')}
                    className="font-semibold hover:bg-transparent p-0"
                  >
                    Cliente
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Sectores</TableHead>
                <TableHead>Ubicaciones</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('date')}
                    className="font-semibold hover:bg-transparent p-0"
                  >
                    Fecha
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMandates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No se encontraron mandatos que coincidan con los criterios de búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMandates.map((mandate) => (
                  <TableRow key={mandate.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {mandate.mandate_name}
                        </div>
                        {mandate.other_criteria && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {mandate.other_criteria.substring(0, 60)}
                            {mandate.other_criteria.length > 60 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{mandate.client_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {mandate.client_contact}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {mandate.target_sectors.slice(0, 2).map((sector, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            <Building2 className="h-3 w-3 mr-1" />
                            {sector}
                          </Badge>
                        ))}
                        {mandate.target_sectors.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{mandate.target_sectors.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {mandate.target_locations?.slice(0, 2).map((location, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {location}
                          </Badge>
                        ))}
                        {(mandate.target_locations?.length || 0) > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{(mandate.target_locations?.length || 0) - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getStatusColor(mandate.status)}>
                        {getStatusText(mandate.status)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(mandate.created_at), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {mandate.assigned_user_name || 'Sin asignar'}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(mandate.id)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
