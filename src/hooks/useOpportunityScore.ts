import { useMemo } from 'react';
import { Opportunity } from '@/types/Opportunity';

export interface OpportunityScoreResult {
  score: number; // 0-100
  factors: {
    sector_attractiveness: number;
    investment_capacity: number;
    urgency: number;
    strategic_fit: number;
  };
  chips: string[]; // etiquetas justificativas
}

export const useOpportunityScore = (opportunity: Opportunity | null): OpportunityScoreResult => {
  return useMemo(() => {
    if (!opportunity) {
      return {
        score: 0,
        factors: { sector_attractiveness: 0, investment_capacity: 0, urgency: 0, strategic_fit: 0 },
        chips: []
      };
    }

    const sa = clamp(opportunity.sector_attractiveness ?? 0);
    const ic = clamp(opportunity.investment_capacity ?? 0);
    const ug = clamp(opportunity.urgency ?? 0);
    const sf = clamp(opportunity.strategic_fit ?? 0);

    const score = Math.round(sa * 0.25 + ic * 0.25 + ug * 0.20 + sf * 0.30);

    const chips: string[] = [
      `Sector: ${qualify(sa)}`,
      `Capacidad: ${qualify(ic)}`,
      `Urgencia: ${qualify(ug)}`,
      `Fit: ${qualify(sf)}`,
    ];

    return { score, factors: { sector_attractiveness: sa, investment_capacity: ic, urgency: ug, strategic_fit: sf }, chips };
  }, [opportunity?.sector_attractiveness, opportunity?.investment_capacity, opportunity?.urgency, opportunity?.strategic_fit]);
};

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

const qualify = (v: number) => {
  if (v >= 76) return 'Excelente';
  if (v >= 51) return 'Bueno';
  if (v >= 26) return 'Medio';
  return 'Bajo';
};
