import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Building2, 
  Calendar,
  ChevronDown,
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
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter mandates based on search
  const filteredMandates = mandates.filter(mandate => 
    mandate.mandate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mandate.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mandate.target_sectors?.some(sector => 
      sector.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort mandates
  const sortedMandates = [...filteredMandates].sort((a, b) => {
    let aValue = a[sortField as keyof BuyingMandate];
    let bValue = b[sortField as keyof BuyingMandate];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-800 border-green-200' },
      paused: { label: 'Pausado', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      completed: { label: 'Completado', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800 border-red-200' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge className={`${config.className} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const handleMandateClick = (mandate: BuyingMandate) => {
    navigate(`/mandatos/${mandate.id}`);
  };

  const handleClientClick = (mandate: BuyingMandate) => {
    // Could navigate to client details if needed
    console.log('Client clicked:', mandate.client_name);
  };

  return (
    <div className="bg-white rounded-lg border border-border">
      {/* Header with search and actions */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-foreground">
            Mandatos ({filteredMandates.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar mandatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Ordenar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="font-medium text-muted-foreground">Mandato</TableHead>
              <TableHead className="font-medium text-muted-foreground">Cliente</TableHead>
              <TableHead className="font-medium text-muted-foreground">Estado</TableHead>
              <TableHead className="font-medium text-muted-foreground">Sectores</TableHead>
              <TableHead className="font-medium text-muted-foreground">Fecha inicio</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMandates.map((mandate) => (
              <TableRow 
                key={mandate.id} 
                className="border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => handleMandateClick(mandate)}
              >
                <TableCell className="py-4">
                  <div>
                    <button
                      className="font-medium text-primary hover:text-primary/80 text-left transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMandateClick(mandate);
                      }}
                    >
                      {mandate.mandate_name}
                    </button>
                    <div className="text-sm text-muted-foreground mt-1">
                      {mandate.other_criteria && mandate.other_criteria.length > 50
                        ? `${mandate.other_criteria.substring(0, 50)}...`
                        : mandate.other_criteria || 'Sin criterios específicos'
                      }
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="py-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <button
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClientClick(mandate);
                      }}
                    >
                      {mandate.client_name}
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {mandate.client_contact}
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  {getStatusBadge(mandate.status)}
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex flex-wrap gap-1">
                    {mandate.target_sectors?.slice(0, 2).map((sector, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="text-xs bg-muted text-muted-foreground"
                      >
                        {sector}
                      </Badge>
                    ))}
                    {mandate.target_sectors && mandate.target_sectors.length > 2 && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-muted text-muted-foreground"
                      >
                        +{mandate.target_sectors.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(mandate.start_date), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 hover:bg-muted"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMandateClick(mandate);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Building2 className="mr-2 h-4 w-4" />
                        Ver targets
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty state */}
      {filteredMandates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm ? 'No se encontraron mandatos que coincidan con tu búsqueda.' : 'No hay mandatos disponibles.'}
          </div>
        </div>
      )}
    </div>
  );
};