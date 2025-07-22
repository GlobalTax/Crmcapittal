
import { ValoracionPhase, ValoracionStatus } from '@/types/Valoracion';

export const VALORACION_PHASES: Record<ValoracionStatus, ValoracionPhase> = {
  requested: {
    key: 'requested',
    label: 'Solicitada',
    description: 'Valoración recién creada, pendiente de revisión y asignación',
    color: '#F59E0B',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: '📋'
  },
  in_process: {
    key: 'in_process',
    label: 'En Proceso',
    description: 'Análisis y valoración en curso por el equipo asignado',
    color: '#3B82F6',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: '⚡'
  },
  completed: {
    key: 'completed',
    label: 'Completada',
    description: 'Valoración finalizada, informe listo para entrega',
    color: '#10B981',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: '✅'
  },
  delivered: {
    key: 'delivered',
    label: 'Entregada',
    description: 'Informe entregado al cliente, proceso completado',
    color: '#059669',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    icon: '📤'
  }
};

export const getPhaseOrder = (): ValoracionStatus[] => {
  return ['requested', 'in_process', 'completed', 'delivered'];
};

export const getPhaseIndex = (status: ValoracionStatus): number => {
  return getPhaseOrder().indexOf(status);
};

export const canAdvanceToPhase = (currentStatus: ValoracionStatus, targetStatus: ValoracionStatus): boolean => {
  const currentIndex = getPhaseIndex(currentStatus);
  const targetIndex = getPhaseIndex(targetStatus);
  return targetIndex === currentIndex + 1;
};

export const getNextPhase = (currentStatus: ValoracionStatus): ValoracionStatus | null => {
  const phases = getPhaseOrder();
  const currentIndex = getPhaseIndex(currentStatus);
  return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
};
