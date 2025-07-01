
import { Operation } from "@/types/Operation";
import { useToast } from "@/hooks/use-toast";

interface AdminOperationHandlersProps {
  onUpdateOperation: (operationId: string, operationData: Partial<Operation>) => Promise<{ data: any; error: string | null }>;
  onDeleteOperation: (operationId: string) => Promise<{ error: string | null }>;
  onUpdateTeaserUrl: (operationId: string, teaserUrl: string) => Promise<{ data: any; error: string | null }>;
}

export const useAdminOperationHandlers = ({
  onUpdateOperation,
  onDeleteOperation,
  onUpdateTeaserUrl
}: AdminOperationHandlersProps) => {
  const { toast } = useToast();

  const handleDeleteOperation = async (operation: Operation) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la operación "${operation.company_name}"?`)) {
      const { error } = await onDeleteOperation(operation.id);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Operación eliminada",
          description: "La operación se ha eliminado correctamente",
        });
      }
    }
  };

  const handleDownloadTeaser = (operation: Operation) => {
    if (operation.teaser_url) {
      window.open(operation.teaser_url, '_blank');
    }
  };

  const handleSaveEdit = async (operationId: string, operationData: Partial<Operation>) => {
    console.log('Guardando cambios para operación:', operationId);
    console.log('Datos a actualizar:', operationData);
    
    try {
      const { error } = await onUpdateOperation(operationId, operationData);
      
      if (error) {
        console.error('Error al actualizar:', error);
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return { success: false };
      } else {
        console.log('Operación actualizada exitosamente');
        toast({
          title: "Operación actualizada",
          description: "Los cambios se han guardado correctamente",
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Error inesperado al actualizar:', error);
      toast({
        title: "Error",
        description: "Error inesperado al actualizar la operación",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const handleUploadComplete = async (operationId: string, teaserUrl: string) => {
    const { error } = await onUpdateTeaserUrl(operationId, teaserUrl);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Teaser actualizado",
        description: "El teaser se ha subido correctamente",
      });
    }
  };

  return {
    handleDeleteOperation,
    handleDownloadTeaser,
    handleSaveEdit,
    handleUploadComplete
  };
};
