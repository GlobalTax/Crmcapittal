import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ValoracionPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canChangeAssociation: boolean;
  canAdvancePhase: boolean;
  canManageFees: boolean;
  reason?: string;
}

interface EntityPermissions {
  canViewCompany: boolean;
  canEditCompany: boolean;
  canViewContact: boolean;
  canEditContact: boolean;
}

export const useValoracionPermissions = (valoracion?: any) => {
  const [permissions, setPermissions] = useState<ValoracionPermissions>({
    canView: false,
    canEdit: false,
    canDelete: false,
    canChangeAssociation: false,
    canAdvancePhase: false,
    canManageFees: false,
  });
  
  const [entityPermissions, setEntityPermissions] = useState<EntityPermissions>({
    canViewCompany: false,
    canEditCompany: false,
    canViewContact: false,
    canEditContact: false,
  });

  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !valoracion) {
      setLoading(false);
      return;
    }

    checkPermissions();
  }, [user, valoracion]);

  const checkPermissions = async () => {
    try {
      setLoading(true);

      // Verificar permisos básicos de administrador
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .in('role', ['admin', 'superadmin']);
      
      const isAdmin = userRoles && userRoles.length > 0;
      
      // Verificar si el usuario está asignado a la valoración
      const isAssigned = valoracion.assigned_to === user?.email;

      // Verificar permisos sobre la empresa asociada
      let companyPermissions = { canView: false, canEdit: false };
      if (valoracion.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('created_by, owner_id, company_status')
          .eq('id', valoracion.company_id)
          .single();

        if (companyData) {
          const ownsCompany = companyData.created_by === user?.id || companyData.owner_id === user?.id;
          const companyActive = companyData.company_status !== 'inactiva';
          
          companyPermissions = {
            canView: isAdmin || ownsCompany,
            canEdit: (isAdmin || ownsCompany) && companyActive
          };
        }
      }

      // Verificar permisos sobre el contacto asociado
      let contactPermissions = { canView: false, canEdit: false };
      if (valoracion.contact_id) {
        const { data: contactData } = await supabase
          .from('contacts')
          .select('created_by')
          .eq('id', valoracion.contact_id)
          .single();

        if (contactData) {
          const ownsContact = contactData.created_by === user?.id;
          
          contactPermissions = {
            canView: isAdmin || ownsContact,
            canEdit: isAdmin || ownsContact
          };
        }
      }

      // Determinar permisos finales
      const canViewViaEntity = valoracion.company_id ? companyPermissions.canView : true;
      const canEditViaEntity = valoracion.company_id ? companyPermissions.canEdit : true;

      const finalPermissions: ValoracionPermissions = {
        canView: isAdmin || isAssigned || canViewViaEntity,
        canEdit: isAdmin || (isAssigned && canEditViaEntity),
        canDelete: isAdmin,
        canChangeAssociation: isAdmin || (isAssigned && canEditViaEntity),
        canAdvancePhase: isAdmin || (isAssigned && canEditViaEntity),
        canManageFees: isAdmin || (isAssigned && canEditViaEntity),
      };

      // Añadir razones para permisos denegados
      if (!finalPermissions.canView) {
        finalPermissions.reason = 'No tienes permisos para ver esta valoración';
      } else if (!finalPermissions.canEdit) {
        finalPermissions.reason = 'No tienes permisos para editar esta valoración';
      }

      setPermissions(finalPermissions);
      setEntityPermissions({
        canViewCompany: companyPermissions.canView,
        canEditCompany: companyPermissions.canEdit,
        canViewContact: contactPermissions.canView,
        canEditContact: contactPermissions.canEdit,
      });

    } catch (error) {
      console.error('Error checking valoracion permissions:', error);
      setPermissions({
        canView: false,
        canEdit: false,
        canDelete: false,
        canChangeAssociation: false,
        canAdvancePhase: false,
        canManageFees: false,
        reason: 'Error verificando permisos',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateAction = (action: keyof ValoracionPermissions, showToast = true): boolean => {
    const hasPermission = permissions[action] as boolean;
    
    if (!hasPermission && showToast && permissions.reason) {
      console.warn(`Acción denegada: ${action}. Motivo: ${permissions.reason}`);
    }
    
    return hasPermission;
  };

  const getPermissionReason = (action: keyof ValoracionPermissions): string => {
    if (permissions[action]) return '';
    
    switch (action) {
      case 'canView':
        return 'No tienes acceso para ver esta valoración';
      case 'canEdit':
        return 'No puedes editar esta valoración. Debe estar asignada a ti y tener permisos sobre las entidades asociadas';
      case 'canDelete':
        return 'Solo los administradores pueden eliminar valoraciones';
      case 'canChangeAssociation':
        return 'No puedes cambiar las asociaciones de empresa/contacto de esta valoración';
      case 'canAdvancePhase':
        return 'No puedes avanzar la fase de esta valoración';
      case 'canManageFees':
        return 'No puedes gestionar los honorarios de esta valoración';
      default:
        return 'Acción no permitida';
    }
  };

  return {
    ...permissions,
    canUploadDocuments: permissions.canEdit,
    canArchive: permissions.canDelete,
    disabledReason: permissions.reason || '',
    nextPhaseRequiresConfirmation: true,
    entityPermissions,
    loading,
    validateAction,
    getPermissionReason,
    refresh: checkPermissions,
  };
};