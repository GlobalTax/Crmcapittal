
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ValoracionStatus } from '@/types/Valoracion';
import { VALORACION_PHASES, getNextPhase } from '@/utils/valoracionPhases';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ConfirmAdvancePhaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentStatus: ValoracionStatus;
  companyName?: string;
  isDelivering?: boolean;
}

export const ConfirmAdvancePhaseDialog = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  companyName = 'la empresa',
  isDelivering = false
}: ConfirmAdvancePhaseDialogProps) => {
  const nextPhase = getNextPhase(currentStatus);
  const currentPhaseInfo = VALORACION_PHASES[currentStatus];
  const nextPhaseInfo = nextPhase ? VALORACION_PHASES[nextPhase] : null;

  const getDialogContent = () => {
    if (isDelivering || currentStatus === 'completed') {
      return {
        icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
        title: '¿Entregar valoración al cliente?',
        description: `Estás a punto de entregar la valoración de ${companyName} al cliente. Esta acción marcará el proceso como completado y el cliente tendrá acceso al informe final.`,
        warning: 'Una vez entregada, la valoración no podrá ser modificada sin crear una nueva versión.',
        confirmText: 'Sí, entregar al cliente',
        cancelText: 'Cancelar'
      };
    }

    return {
      icon: <CheckCircle className="w-6 h-6 text-blue-500" />,
      title: `¿Avanzar a ${nextPhaseInfo?.label}?`,
      description: `Estás a punto de cambiar el estado de la valoración de ${companyName} de "${currentPhaseInfo.label}" a "${nextPhaseInfo?.label}".`,
      warning: nextPhase === 'delivered' 
        ? 'Esta acción entregará la valoración al cliente y no podrá deshacerse.'
        : 'Asegúrate de que se han completado todos los requisitos de la fase actual.',
      confirmText: 'Sí, avanzar fase',
      cancelText: 'Cancelar'
    };
  };

  const content = getDialogContent();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {content.icon}
            <AlertDialogTitle>{content.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>{content.description}</p>
            {content.warning && (
              <p className="text-orange-600 font-medium">
                ⚠️ {content.warning}
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            {content.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={isDelivering ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            {content.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
