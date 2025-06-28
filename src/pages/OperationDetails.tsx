import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EditOperationDialog } from "@/components/admin/EditOperationDialog";
import { useOperationsMutations } from "@/hooks/operations/useOperationsMutations";
import { useUserRole } from "@/hooks/useUserRole";
import { Operation } from "@/types/Operation";
import { OperationHeader } from "@/components/operation-details/OperationHeader";
import { OperationBasicInfo } from "@/components/operation-details/OperationBasicInfo";
import { OperationFinancialInfo } from "@/components/operation-details/OperationFinancialInfo";
import { OperationTransactionDetails } from "@/components/operation-details/OperationTransactionDetails";
import { OperationSidebar } from "@/components/operation-details/OperationSidebar";

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
          <button onClick={() => navigate('/admin')}>
            Volver al panel de administración
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <OperationHeader 
          operation={operation}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <OperationBasicInfo operation={operation} />
            <OperationFinancialInfo 
              operation={operation} 
              formatAmount={formatAmount}
            />
            <OperationTransactionDetails operation={operation} />
          </div>

          <OperationSidebar operation={operation} />
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
