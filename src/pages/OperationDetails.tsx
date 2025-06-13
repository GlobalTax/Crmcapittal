import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Edit, Trash2, Download, Upload, Building, Calendar, DollarSign, User, MapPin, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditOperationDialog } from "@/components/admin/EditOperationDialog";
import { useOperationsMutations } from "@/hooks/operations/useOperationsMutations";
import { useUserRole } from "@/hooks/useUserRole";
import { Operation } from "@/types/Operation";
import { getStatusLabel, getOperationTypeLabel, getStatusColor } from "@/utils/operationHelpers";

const OperationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [operations, setOperations] = useState<Operation[]>([]);
  const { updateOperation, deleteOperation } = useOperationsMutations(setOperations);
  const { role, loading: roleLoading } = useUserRole();

  const isAdmin = role === 'admin' || role === 'superadmin';

  const { data: operation, isLoading, error, refetch } = useQuery({
    queryKey: ['operation-details', id],
    queryFn: async () => {
      if (!id) throw new Error('ID de operación requerido');
      
      console.log('Fetching operation details for ID:', id);
      
      const { data, error } = await supabase
        .from('operations')
        .select(`
          *,
          operation_managers!manager_id (
            id,
            name,
            position,
            email,
            phone,
            photo
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching operation:', error);
        throw error;
      }

      console.log('Operation data:', data);

      // Transform data to match our interface
      return {
        ...data,
        manager: data.operation_managers ? {
          id: data.operation_managers.id,
          name: data.operation_managers.name,
          position: data.operation_managers.position,
          email: data.operation_managers.email,
          phone: data.operation_managers.phone,
          photo: data.operation_managers.photo
        } : null
      } as Operation;
    },
    enabled: !!id
  });

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!operation) return;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar la operación "${operation.company_name}"?`)) {
      const { error } = await deleteOperation(operation.id);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Operación eliminada",
          description: "La operación se ha eliminado correctamente"
        });
        navigate('/admin');
      }
    }
  };

  const handleSaveEdit = async (operationData: Partial<Operation>) => {
    if (!operation) return;
    
    try {
      const result = await updateOperation(operation.id, operationData);
      
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
        description: "Operación actualizada correctamente"
      });
      
      refetch();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating operation:', error);
      toast({
        title: "Error",
        description: "Error al actualizar la operación",
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

  if (isLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando detalles de la operación...</p>
        </div>
      </div>
    );
  }

  if (error || !operation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar la operación</p>
          <Button onClick={() => navigate('/admin')}>
            Volver al panel de administración
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Panel
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{operation.company_name}</h1>
              <p className="text-slate-600">{operation.project_name || 'Detalles de la operación'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(operation.status)}>
              {getStatusLabel(operation.status)}
            </Badge>
            {isAdmin && (
              <>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Empresa</label>
                    <p className="text-sm font-semibold">{operation.company_name}</p>
                  </div>
                  {operation.project_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Proyecto</label>
                      <p className="text-sm">{operation.project_name}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Sector</label>
                    <p className="text-sm">{operation.sector}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tipo de Operación</label>
                    <p className="text-sm">{getOperationTypeLabel(operation.operation_type)}</p>
                  </div>
                  {operation.cif && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">CIF</label>
                      <p className="text-sm">{operation.cif}</p>
                    </div>
                  )}
                  {operation.location && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ubicación</label>
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {operation.location}
                      </p>
                    </div>
                  )}
                </div>
                
                {operation.description && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-600">Descripción</label>
                      <p className="text-sm mt-2 leading-relaxed">{operation.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Información Financiera
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {operation.revenue && (
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-2xl font-bold text-green-600">
                        {formatAmount(operation.revenue, operation.currency)}
                      </p>
                      <p className="text-sm text-gray-600">Facturación</p>
                    </div>
                  )}
                  
                  {operation.ebitda && (
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="text-2xl font-bold text-purple-600">
                        {formatAmount(operation.ebitda, operation.currency)}
                      </p>
                      <p className="text-sm text-gray-600">EBITDA</p>
                    </div>
                  )}
                </div>

                {operation.annual_growth_rate && (
                  <div className="mt-4 text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <p className="text-xl font-bold text-yellow-600">
                      {operation.annual_growth_rate}%
                    </p>
                    <p className="text-sm text-gray-600">Crecimiento Anual</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transaction Details */}
            {(operation.buyer || operation.seller) && (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Detalles de la Transacción</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {operation.buyer && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Comprador</label>
                        <p className="text-sm">{operation.buyer}</p>
                      </div>
                    )}
                    {operation.seller && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Vendedor</label>
                        <p className="text-sm">{operation.seller}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Date */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Estado y Fechas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Estado</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(operation.status)}>
                      {getStatusLabel(operation.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Operación</label>
                  <p className="text-sm">{new Date(operation.date).toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
                  <p className="text-sm">{new Date(operation.created_at).toLocaleDateString('es-ES')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Manager */}
            {operation.manager && (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Gestor Asignado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={operation.manager.photo} 
                        alt={operation.manager.name}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {operation.manager.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{operation.manager.name}</p>
                      {operation.manager.position && (
                        <p className="text-sm text-gray-600">{operation.manager.position}</p>
                      )}
                    </div>
                  </div>
                  {operation.manager.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${operation.manager.email}`} className="text-blue-600 hover:underline">
                        {operation.manager.email}
                      </a>
                    </div>
                  )}
                  {operation.manager.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${operation.manager.phone}`} className="text-blue-600 hover:underline">
                        {operation.manager.phone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Teaser */}
            {operation.teaser_url && (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Documentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(operation.teaser_url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Teaser
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {isAdmin && (
        <EditOperationDialog
          operation={operation}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default OperationDetails;
