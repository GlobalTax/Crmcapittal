
import { Company } from '@/types/Company';

export interface ProfileScoreResult {
  score: number;
  status: 'high' | 'medium' | 'low';
  color: string;
  icon: string;
  details: {
    basicInfo: number;
    contactInfo: number;
    businessInfo: number;
    relationshipData: number;
  };
}

export const calculateProfileScore = (
  company: Company,
  enrichmentData?: any,
  contactsCount: number = 0,
  opportunitiesCount: number = 0
): ProfileScoreResult => {
  let basicInfo = 0;
  let contactInfo = 0;
  let businessInfo = 0;
  let relationshipData = 0;

  // Basic Info (25 points max)
  if (company.name) basicInfo += 10;
  if (company.domain) basicInfo += 5;
  if (company.description) basicInfo += 5;
  if (company.website) basicInfo += 5;

  // Contact Info (20 points max)
  if (company.phone) contactInfo += 7;
  if (company.address || company.city) contactInfo += 6;
  if (company.city && company.state) contactInfo += 4;
  if (company.postal_code) contactInfo += 3;

  // Business Info (30 points max)
  if (company.industry || enrichmentData?.sector) businessInfo += 10;
  if (company.annual_revenue || enrichmentData?.revenue) businessInfo += 10;
  if (company.founded_year) businessInfo += 5;
  if (company.company_size !== '1-10') businessInfo += 5;

  // Relationship Data (25 points max)
  if (contactsCount > 0) relationshipData += 10;
  if (contactsCount > 2) relationshipData += 5;
  if (opportunitiesCount > 0) relationshipData += 7;
  if (company.notes) relationshipData += 3;

  const totalScore = basicInfo + contactInfo + businessInfo + relationshipData;

  let status: 'high' | 'medium' | 'low';
  let color: string;
  let icon: string;

  if (totalScore >= 70) {
    status = 'high';
    color = 'text-green-600';
    icon = '🟢';
  } else if (totalScore >= 40) {
    status = 'medium';
    color = 'text-yellow-600';
    icon = '🟡';
  } else {
    status = 'low';
    color = 'text-red-600';
    icon = '🔴';
  }

  return {
    score: totalScore,
    status,
    color,
    icon,
    details: {
      basicInfo,
      contactInfo,
      businessInfo,
      relationshipData
    }
  };
};

export const formatRevenue = (revenue?: number | string): string => {
  if (!revenue) return '—';
  
  const numRevenue = typeof revenue === 'string' ? parseFloat(revenue) : revenue;
  if (isNaN(numRevenue)) return '—';
  
  if (numRevenue >= 1000000) {
    return `€${(numRevenue / 1000000).toFixed(1)}M`;
  } else if (numRevenue >= 1000) {
    return `€${(numRevenue / 1000).toFixed(0)}K`;
  } else {
    return `€${numRevenue.toLocaleString()}`;
  }
};

export const formatLocation = (city?: string, state?: string): string => {
  if (!city && !state) return '—';
  if (city && state) return `${city}, ${state}`;
  return city || state || '—';
};
