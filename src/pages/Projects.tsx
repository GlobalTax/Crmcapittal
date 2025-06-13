
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, ArrowLeft, Building, Calendar, DollarSign, MapPin, Edit, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EditOperationDialog } from "@/components/admin/EditOperationDialog";
import { useOperationsMutations } from "@/hooks/operations/useOperationsMutations";
import { useToast } from "@/hooks/use-toast";
import { Operation } from "@/types/Operation";

interface Project {
  id: string;
  company_name: string;
  project_name: string | null;
  sector: string;
  operation_type: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  location: string | null;
  description: string | null;
  created_at: string;
  manager_id?: string | null;
  manager?: {
    id: string;
    name: string;
    position: string;
    email: string;
    phone: string;
  } | null;
}

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['all-projects', searchTerm, statusFilter, sectorFilter, typeFilter],
    queryFn: async () => {
      console.log('Fetching all projects...');
      
      let query = supabase
        .from('operations')
        .select(`
          id,
          company_name,
          project_name,
          sector,
          operation_type,
          amount,
          currency,
          status,
          date,
          location,
          description,
          created_at,
          manager_id,
          cif,
          buyer,
          seller,
          contact_email,
          contact_phone,
          revenue,
          ebitda,
          annual_growth_rate,
          operation_managers!manager_id (
            id,
            name,
            position,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (sectorFilter !== 'all') {
        query = query.eq('sector', sectorFilter);
      }
      
      if (typeFilter !== 'all') {
        query = query.eq('operation_type', typeFilter);
      }

      if (searchTerm) {
        query = query.or(`company_name.ilike.%${searchTerm}%,project_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      console.log('Raw data from Supabase:', data);

      // Transform data to match our interface
      return (data || []).map(project => ({
        ...project,
        manager: project.operation_managers ? {
          id: project.operation_managers.id,
          name: project.operation_managers.name,
          position: project.operation_managers.position,
          email: project.operation_managers.email,
          phone: project.operation_managers.phone
        } : null
      })) as Project[];
    },
  });

  // Set up mutations for operations
  const [operations, setOperations] = useState<Operation[]>([]);
  const { updateOperation } = useOperationsMutations(setOperations);

  const handleEditOperation = (project: Project) => {
    console.log('Editing operation:', project);
    // Convert Project to Operation format
    const operation: Operation = {
      id: project.id,
      company_name: project.company_name,
      project_name: project.project_name,
      sector: project.sector,
      operation_type: project.operation_type as Operation['operation_type'],
      amount: project.amount,
      currency: project.currency,
      status: project.status as Operation['status'],
      date: project.date,
      location: project.location,
      description: project.description,
      created_at: project.created_at,
      updated_at: project.created_at,
      manager_id: project.manager_id || null,
      cif: null,
      buyer: null,
      seller: null,
      contact_email: null,
      contact_phone: null,
      revenue: null,
      ebitda: null,
      annual_growth_rate: null,
      created_by: null,
      teaser_url: null,
      manager: project.manager
    };
    
    setEditingOperation(operation);
    setIsEditDialogOpen(true);
  };

  const handleSaveOperation = async (operationData: Partial<Operation>) => {
    if (!editingOperation) return;
    
    try {
      console.log('Saving operation:', operationData);
      const result = await updateOperation(editingOperation.id, operationData);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Éxito",
        description: "Proyecto actualizado correctamente"
      });
      
      // Refresh the projects list
      refetch();
      setIsEditDialogOpen(false);
      setEditingOperation(null);
    } catch (error) {
      console.error('Error updating operation:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el proyecto",
        variant: "destructive"
      });
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'pending': return 'Pendiente';
      case 'closed': return 'Cerrado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getOperationTypeLabel = (type: string) => {
    switch (type) {
      case 'merger': return 'Fusión';
      case 'sale': return 'Venta';
      case 'partial_sale': return 'Venta Parcial';
      case 'buy_mandate': return 'Mandato de Compra';
      case 'acquisition': return 'Adquisición';
      default: return type;
    }
  };

  // Get unique values for filters
  const uniqueSectors = [...new Set(projects?.map(p => p.sector) || [])];
  const uniqueTypes = [...new Set(projects?.map(p => p.operation_type) || [])];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Projects query error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error al cargar los proyectos: {error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  console.log('Final projects data:', projects);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Proyectos</h1>
            <p className="text-slate-600">Gestiona y visualiza todos los proyectos del sistema</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {projects?.filter(p => p.status === 'available').length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects ? formatAmount(
                  projects.reduce((sum, p) => sum + (p.amount || 0), 0), 
                  'EUR'
                ) : '€0'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sectores</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueSectors.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los sectores</SelectItem>
                  {uniqueSectors.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>{getOperationTypeLabel(type)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setSectorFilter("all");
                  setTypeFilter("all");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Importe</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Gestor</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{project.company_name}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{project.project_name || 'Sin nombre'}</div>
                            {project.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {project.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{project.sector}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {getOperationTypeLabel(project.operation_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(project.amount, project.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.manager ? (
                            <div>
                              <div className="font-medium text-sm">{project.manager.name}</div>
                              <div className="text-xs text-gray-500">{project.manager.position}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Sin asignar</span>
                          )}
                        </TableCell>
                        <TableCell>{project.location || 'No especificada'}</TableCell>
                        <TableCell>
                          {new Date(project.date).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditOperation(project)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proyectos</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || sectorFilter !== 'all' || typeFilter !== 'all'
                    ? 'No se encontraron proyectos con los filtros aplicados'
                    : 'No hay proyectos en el sistema'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Operation Dialog */}
      <EditOperationDialog
        operation={editingOperation}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveOperation}
      />
    </div>
  );
};

export default Projects;
