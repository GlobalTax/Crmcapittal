
import { Negocio } from '@/types/Negocio';

export const groupNegociosByStage = (negocios: Negocio[]) => {
  return negocios.reduce((acc, negocio) => {
    const stageId = negocio.stage_id || 'sin-etapa';
    const stageName = negocio.stage?.name || 'Sin Etapa';
    
    if (!acc[stageId]) {
      acc[stageId] = {
        id: stageId,
        name: stageName,
        negocios: []
      };
    }
    acc[stageId].negocios.push(negocio);
    return acc;
  }, {} as Record<string, { id: string; name: string; negocios: Negocio[] }>);
};

export const calculateStageValue = (negocios: Negocio[]) => {
  return negocios.reduce((total, negocio) => total + (negocio.valor_negocio || 0), 0);
};

export const formatCurrency = (amount: number, currency = 'EUR') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
