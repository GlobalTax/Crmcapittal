
import { ReconversionStatus, ReconversionPriority } from '@/types/Reconversion';

export interface ReconversionPhase {
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const RECONVERSION_PHASES: Record<ReconversionStatus, ReconversionPhase> = {
  activa: {
    label: 'Activa',
    description: 'Reconversión en proceso activo',
    icon: '🔄',
    color: 'hsl(var(--primary))',
    bgColor: 'bg-primary/10',
    textColor: 'text-primary'
  },
  en_matching: {
    label: 'En Matching',
    description: 'Buscando coincidencias activamente',
    icon: '🎯',
    color: 'hsl(var(--warning))',
    bgColor: 'bg-warning/10',
    textColor: 'text-warning-foreground'
  },
  pausada: {
    label: 'Pausada',
    description: 'Temporalmente suspendida',
    icon: '⏸️',
    color: 'hsl(var(--muted))',
    bgColor: 'bg-muted/50',
    textColor: 'text-muted-foreground'
  },
  cerrada: {
    label: 'Cerrada',
    description: 'Proceso finalizado',
    icon: '✅',
    color: 'hsl(var(--success))',
    bgColor: 'bg-success/10',
    textColor: 'text-success-foreground'
  }
};

export const RECONVERSION_PRIORITIES: Record<ReconversionPriority, ReconversionPhase> = {
  baja: {
    label: 'Baja',
    description: 'Prioridad baja',
    icon: '🟢',
    color: 'hsl(var(--success))',
    bgColor: 'bg-success/10',
    textColor: 'text-success-foreground'
  },
  media: {
    label: 'Media',
    description: 'Prioridad media',
    icon: '🟡',
    color: 'hsl(var(--warning))',
    bgColor: 'bg-warning/10',
    textColor: 'text-warning-foreground'
  },
  alta: {
    label: 'Alta',
    description: 'Prioridad alta',
    icon: '🟠',
    color: 'hsl(221.2 83.2% 53.3%)',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800'
  },
  urgente: {
    label: 'Urgente',
    description: 'Requiere atención inmediata',
    icon: '🔴',
    color: 'hsl(var(--destructive))',
    bgColor: 'bg-destructive/10',
    textColor: 'text-destructive-foreground'
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: amount > 999999 ? 'compact' : 'standard'
  }).format(amount);
};

export const formatInvestmentRange = (min?: number, max?: number): string => {
  if (!min && !max) return 'No especificado';
  if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  if (min) return `Desde ${formatCurrency(min)}`;
  if (max) return `Hasta ${formatCurrency(max)}`;
  return 'No especificado';
};
