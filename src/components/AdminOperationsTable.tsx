
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Operation } from "@/types/Operation";
import { getStatusLabel, getOperationTypeLabel } from "@/utils/operationHelpers";
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Download,
  Upload,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react";

interface AdminOperationsTableProps {
  operations: Operation[];
  loading: boolean;
  error: string | null;
}

export const AdminOperationsTable = ({ 
  operations, 
  loading, 
  error 
}: AdminOperationsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSector, setFilterSector] = useState<string>("all");

  // Filter operations based on search and filters
  const filteredOperations = operations.filter(operation => {
    const matchesSearch = operation.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         operation.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         operation.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || operation.status === filterStatus;
    const matchesSector = filterSector === "all" || operation.sector === filterSector;
    
    return matchesSearch && matchesStatus && matchesSector;
  });

  // Get unique sectors for filter dropdown
  const uniqueSectors = Array.from(new Set(operations.map(op => op.sector)));

  const handleViewDetails = (operation: Operation) => {
    // TODO: Implement view details modal
    console.log("View details for:", operation.company_name);
  };

  const handleEditOperation = (operation: Operation) => {
    // TODO: Implement edit operation functionality
    console.log("Edit operation:", operation.company_name);
  };

  const handleDeleteOperation = (operation: Operation) => {
    // TODO: Implement delete operation functionality
    console.log("Delete operation:", operation.company_name);
  };

  const handleUploadTeaser = (operation: Operation) => {
    // TODO: Implement upload teaser functionality
    console.log("Upload teaser for:", operation.company_name);
  };

  const handleDownloadTeaser = (operation: Operation) => {
    // TODO: Implement download teaser functionality
    console.log("Download teaser for:", operation.company_name);
  };

  const getStatusBadgeVariant = (status: Operation['status']) => {
    switch (status) {
      case 'available': return 'default';
      case 'pending_review': return 'secondary';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'in_process': return 'secondary';
      case 'sold': return 'outline';
      case 'withdrawn': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Gestión de Operaciones</h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Gestión de Operaciones</h2>
        </div>
        <div className="flex items-center justify-center h-32 text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Filters */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Gestión de Operaciones</h2>
          <Badge variant="outline" className="text-xs">
            {filteredOperations.length} de {operations.length} operaciones
          </Badge>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por empresa, sector o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="pending_review">Pendiente revisión</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
            <option value="in_process">En proceso</option>
            <option value="sold">Vendido</option>
            <option value="withdrawn">Retirado</option>
          </select>

          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todos los sectores</option>
            {uniqueSectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Operations Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Teaser</TableHead>
              <TableHead>Gestor</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOperations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-gray-500">
                    {searchTerm || filterStatus !== "all" || filterSector !== "all" 
                      ? "No se encontraron operaciones con los filtros aplicados"
                      : "No hay operaciones disponibles"
                    }
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOperations.map((operation) => (
                <TableRow key={operation.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{operation.company_name}</div>
                      <div className="text-xs text-gray-500">{operation.location}</div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">{operation.sector}</span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">
                      {getOperationTypeLabel(operation.operation_type)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm font-medium">
                      {operation.currency} {(operation.amount / 1000000).toFixed(1)}M
                    </div>
                    {operation.revenue && (
                      <div className="text-xs text-gray-500">
                        Rev: €{(operation.revenue / 1000000).toFixed(1)}M
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(operation.status)} className="text-xs">
                      {getStatusLabel(operation.status)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {operation.photo_url ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadTeaser(operation)}
                            className="h-6 px-2 text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUploadTeaser(operation)}
                            className="h-6 px-2 text-xs"
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Subir
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {operation.manager ? (
                      <div>
                        <div className="text-sm font-medium">{operation.manager.name}</div>
                        <div className="text-xs text-gray-500">{operation.manager.position}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sin asignar</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">
                      {new Date(operation.date).toLocaleDateString('es-ES')}
                    </span>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(operation)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditOperation(operation)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteOperation(operation)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
