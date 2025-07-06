import { useMemo } from 'react';
import { Company } from '@/types/Company';

interface ProfileScore {
  score: number;
  level: 'low' | 'medium' | 'high';
  color: string;
  completedFields: string[];
  missingFields: string[];
}

export const useCompanyProfileScore = (company: Company | null, enrichmentData?: any) => {
  return useMemo<ProfileScore>(() => {
    if (!company) {
      return {
        score: 0,
        level: 'low',
        color: 'hsl(var(--destructive))',
        completedFields: [],
        missingFields: [],
      };
    }

    const completedFields: string[] = [];
    const missingFields: string[] = [];
    let totalPoints = 0;
    const maxPoints = 100;

    // Basic data (20 points)
    const basicFields = [
      { field: 'name', label: 'Nombre', points: 5 },
      { field: 'phone', label: 'Teléfono', points: 5 },
      { field: 'address', label: 'Dirección', points: 5 },
      { field: 'website', label: 'Website', points: 5 },
    ];

    basicFields.forEach(({ field, label, points }) => {
      if (company[field as keyof Company]) {
        completedFields.push(label);
        totalPoints += points;
      } else {
        missingFields.push(label);
      }
    });

    // Commercial data (30 points)
    const commercialFields = [
      { field: 'industry', label: 'Industria', points: 10 },
      { field: 'company_size', label: 'Tamaño empresa', points: 10 },
      { field: 'annual_revenue', label: 'Ingresos anuales', points: 10 },
    ];

    commercialFields.forEach(({ field, label, points }) => {
      if (company[field as keyof Company]) {
        completedFields.push(label);
        totalPoints += points;
      } else {
        missingFields.push(label);
      }
    });

    // eInforma data (30 points)
    const einformaFields = [
      { field: 'sector', label: 'Sector (eInforma)', points: 8 },
      { field: 'cnae', label: 'CNAE', points: 7 },
      { field: 'empleados', label: 'Empleados (eInforma)', points: 8 },
      { field: 'ingresos', label: 'Ingresos (eInforma)', points: 7 },
    ];

    einformaFields.forEach(({ field: enrichmentField, label, points }) => {
      if (enrichmentData?.[enrichmentField]) {
        completedFields.push(label);
        totalPoints += points;
      } else {
        missingFields.push(label);
      }
    });

    // CRM Activity (20 points) - will be handled separately with stats
    // For now, add points if company has activity dates
    if (company.last_activity_date) {
      completedFields.push('Actividad reciente');
      totalPoints += 10;
    } else {
      missingFields.push('Actividad reciente');
    }

    if (company.first_contact_date) {
      completedFields.push('Primer contacto');
      totalPoints += 10;
    } else {
      missingFields.push('Primer contacto');
    }

    const score = Math.round((totalPoints / maxPoints) * 100);
    
    let level: 'low' | 'medium' | 'high';
    let color: string;

    if (score >= 70) {
      level = 'high';
      color = 'hsl(var(--success))';
    } else if (score >= 40) {
      level = 'medium';
      color = 'hsl(var(--warning))';
    } else {
      level = 'low';
      color = 'hsl(var(--destructive))';
    }

    return {
      score,
      level,
      color,
      completedFields,
      missingFields,
    };
  }, [company, enrichmentData]);
};