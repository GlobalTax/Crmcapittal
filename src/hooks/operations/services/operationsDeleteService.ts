
import { supabase } from '@/integrations/supabase/client';

export const deleteOperationFromDB = async (operationId: string, userRole?: string) => {
  console.log('Intentando eliminar operación:', operationId, 'con rol:', userRole);
  
  // Si es admin o superadmin, permitir eliminar cualquier operación
  if (userRole === 'admin' || userRole === 'superadmin') {
    const { error } = await supabase
      .from('operations')
      .delete()
      .eq('id', operationId);

    if (error) {
      console.error('Error eliminando operación como admin:', error);
      throw error;
    }
    
    console.log('Operación eliminada exitosamente por admin');
    return;
  }

  // Para usuarios normales, solo eliminar si son el creador
  const { error } = await supabase
    .from('operations')
    .delete()
    .eq('id', operationId)
    .eq('created_by', (await supabase.auth.getUser()).data.user?.id);

  if (error) {
    console.error('Error eliminando operación como usuario:', error);
    throw error;
  }
  
  console.log('Operación eliminada exitosamente por usuario');
};
