import { useMemo } from 'react';
import { Company } from '@/types/Company';

interface CompanyScoreCategory {
  name: string;
  points: number;
  maxPoints: number;
  completedFields: string[];
  missingFields: string[];
}

interface ProfileScore {
  score: number;
  level: 'low' | 'medium' | 'high' | 'excellent';
  color: string;
  categories: CompanyScoreCategory[];
  totalCompleted: number;
  totalFields: number;
}

export const useCompanyProfileScore = (company: Company | null, enrichmentData?: any) => {
  return useMemo<ProfileScore>(() => {
    if (!company) {
      return {
        score: 0,
        level: 'low',
        color: 'hsl(var(--destructive))',
        categories: [],
        totalCompleted: 0,
        totalFields: 0,
      };
    }

    const categories: CompanyScoreCategory[] = [];

    // 1. Industry/Subindustry (20 puntos)
    const industryCategory: CompanyScoreCategory = {
      name: 'Industria/Subindustria',
      points: 0,
      maxPoints: 20,
      completedFields: [],
      missingFields: [],
    };

    const industryFields = [
      { field: 'industry_tax', label: 'Industria (taxonomía)', points: 10 },
      { field: 'subindustry_tax', label: 'Subindustria', points: 10 },
    ];

    industryFields.forEach(({ field, label, points }) => {
      if (company[field as keyof Company]) {
        industryCategory.completedFields.push(label);
        industryCategory.points += points;
      } else {
        industryCategory.missingFields.push(label);
      }
    });

    categories.push(industryCategory);

    // 2. Size bands (25 puntos)
    const sizeBandsCategory: CompanyScoreCategory = {
      name: 'Bandas de tamaño',
      points: 0,
      maxPoints: 25,
      completedFields: [],
      missingFields: [],
    };

    const sizeBandsFields = [
      { field: 'employees_band', label: 'Banda empleados', points: 8 },
      { field: 'company_size', label: 'Tamaño empresa', points: 8 },
      { field: 'revenue_band', label: 'Banda ingresos', points: 9 },
    ];

    sizeBandsFields.forEach(({ field, label, points }) => {
      if (company[field as keyof Company]) {
        sizeBandsCategory.completedFields.push(label);
        sizeBandsCategory.points += points;
      } else {
        sizeBandsCategory.missingFields.push(label);
      }
    });

    categories.push(sizeBandsCategory);

    // 3. Geography (15 puntos)
    const geographyCategory: CompanyScoreCategory = {
      name: 'Geografía',
      points: 0,
      maxPoints: 15,
      completedFields: [],
      missingFields: [],
    };

    const geographyFields = [
      { field: 'country_code', label: 'Código país', points: 5 },
      { field: 'region', label: 'Región', points: 5 },
      { field: 'city', label: 'Ciudad', points: 5 },
    ];

    geographyFields.forEach(({ field, label, points }) => {
      if (company[field as keyof Company]) {
        geographyCategory.completedFields.push(label);
        geographyCategory.points += points;
      } else {
        geographyCategory.missingFields.push(label);
      }
    });

    categories.push(geographyCategory);

    // 4. Financial bands (25 puntos)
    const financialBandsCategory: CompanyScoreCategory = {
      name: 'Bandas financieras',
      points: 0,
      maxPoints: 25,
      completedFields: [],
      missingFields: [],
    };

    const financialBandsFields = [
      { field: 'revenue_band', label: 'Banda ingresos', points: 7 },
      { field: 'ebitda_band', label: 'Banda EBITDA', points: 6 },
      { field: 'margin_band', label: 'Banda margen', points: 6 },
      { field: 'leverage_band', label: 'Banda apalancamiento', points: 6 },
    ];

    financialBandsFields.forEach(({ field, label, points }) => {
      if (company[field as keyof Company]) {
        financialBandsCategory.completedFields.push(label);
        financialBandsCategory.points += points;
      } else {
        financialBandsCategory.missingFields.push(label);
      }
    });

    categories.push(financialBandsCategory);

    // 5. Profile flags (15 puntos)
    const profileFlagsCategory: CompanyScoreCategory = {
      name: 'Banderas del perfil',
      points: 0,
      maxPoints: 15,
      completedFields: [],
      missingFields: [],
    };

    const profileFlagsFields = [
      { field: 'seller_ready', label: 'Preparado para vender', points: 5 },
      { field: 'buyer_active', label: 'Comprador activo', points: 5 },
      { field: 'is_target_account', label: 'Cuenta objetivo', points: 5 },
    ];

    profileFlagsFields.forEach(({ field, label, points }) => {
      if (company[field as keyof Company]) {
        profileFlagsCategory.completedFields.push(label);
        profileFlagsCategory.points += points;
      } else {
        profileFlagsCategory.missingFields.push(label);
      }
    });

    categories.push(profileFlagsCategory);

    // Calculate totals
    const totalPoints = categories.reduce((sum, cat) => sum + cat.points, 0);
    const score = Math.round(totalPoints);
    const totalCompleted = categories.reduce((sum, cat) => sum + cat.completedFields.length, 0);
    const totalFields = categories.reduce((sum, cat) => sum + cat.completedFields.length + cat.missingFields.length, 0);

    // Determine level and color
    let level: 'low' | 'medium' | 'high' | 'excellent';
    let color: string;

    if (score >= 85) {
      level = 'excellent';
      color = 'hsl(var(--success))';
    } else if (score >= 70) {
      level = 'high';
      color = 'hsl(var(--warning))';
    } else if (score >= 50) {
      level = 'medium';
      color = 'hsl(38 92% 48%)';
    } else {
      level = 'low';
      color = 'hsl(var(--destructive))';
    }

    return {
      score,
      level,
      color,
      categories,
      totalCompleted,
      totalFields,
    };
  }, [company, enrichmentData]);
};