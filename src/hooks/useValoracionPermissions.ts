
import { useMemo } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Valoracion, ValoracionStatus } from '@/types/Valoracion';

interface ValoracionPermissions {
  canView: boolean;
  canEdit: boolean;
  canAdvancePhase: boolean;
  canDeliverToClient: boolean;
  canUploadDocuments: boolean;
  canArchive: boolean;
  canDelete: boolean;
  nextPhaseRequiresConfirmation: boolean;
  disabledReason?: string;
}

export const useValoracionPermissions = (valoracion?: Valoracion): ValoracionPermissions => {
  const { user } = useAuth();
  const { role, loading } = useUserRole();

  return useMemo(() => {
    if (loading || !user || !valoracion) {
      return {
        canView: false,
        canEdit: false,
        canAdvancePhase: false,
        canDeliverToClient: false,
        canUploadDocuments: false,
        canArchive: false,
        canDelete: false,
        nextPhaseRequiresConfirmation: false,
        disabledReason: 'Cargando permisos...'
      };
    }

    const isAdmin = role === 'admin' || role === 'superadmin';
    const isSuperAdmin = role === 'superadmin';
    const isAssigned = valoracion.assigned_to === user.email;

    // Base permissions - admins can see all, assigned users can see their own
    const canView = isAdmin || isAssigned;
    const canEdit = isAdmin || isAssigned;

    if (!canView) {
      return {
        canView: false,
        canEdit: false,
        canAdvancePhase: false,
        canDeliverToClient: false,
        canUploadDocuments: false,
        canArchive: false,
        canDelete: false,
        nextPhaseRequiresConfirmation: false,
        disabledReason: 'No tienes permisos para ver esta valoración'
      };
    }

    // Phase-specific permissions
    let canAdvancePhase = false;
    let canDeliverToClient = false;
    let nextPhaseRequiresConfirmation = false;
    let disabledReason: string | undefined;

    switch (valoracion.status) {
      case 'requested':
        // Can advance to 'in_process'
        canAdvancePhase = isAdmin || isAssigned;
        nextPhaseRequiresConfirmation = true;
        if (!canAdvancePhase) {
          disabledReason = 'Solo el responsable asignado o administradores pueden iniciar el proceso';
        }
        break;

      case 'in_process':
        // Can advance to 'completed'
        canAdvancePhase = isAdmin || isAssigned;
        nextPhaseRequiresConfirmation = true;
        if (!canAdvancePhase) {
          disabledReason = 'Solo el responsable asignado o administradores pueden completar la valoración';
        }
        break;

      case 'completed':
        // Can advance to 'delivered' (deliver to client)
        canAdvancePhase = isAdmin;
        canDeliverToClient = isAdmin;
        nextPhaseRequiresConfirmation = true;
        if (!canAdvancePhase) {
          disabledReason = 'Solo los administradores pueden entregar la valoración al cliente';
        }
        break;

      case 'delivered':
        // No further actions allowed
        canAdvancePhase = false;
        disabledReason = 'La valoración ya ha sido entregada al cliente';
        break;

      default:
        disabledReason = 'Estado de valoración no válido';
    }

    return {
      canView,
      canEdit,
      canAdvancePhase,
      canDeliverToClient,
      canUploadDocuments: canEdit,
      canArchive: isAdmin,
      canDelete: isSuperAdmin,
      nextPhaseRequiresConfirmation,
      disabledReason
    };
  }, [user, role, loading, valoracion]);
};
