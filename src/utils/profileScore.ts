import { Company } from "@/types/Company";

export interface ProfileScoreBreakdown {
  score: number;
  color: string;
  icon: string;
  details: {
    basicInfo: number;
    contactInfo: number;
    businessInfo: number;
    relationshipData: number;
  };
}

export const calculateProfileScore = (company: Company, enrichmentData?: any, contactsCount = 0, opportunitiesCount = 0): ProfileScoreBreakdown => {
  let score = 0;
  const details = {
    basicInfo: 0,
    contactInfo: 0,
    businessInfo: 0,
    relationshipData: 0
  };

  // Basic Information (25 points)
  if (company.name) details.basicInfo += 10;
  if (company.domain) details.basicInfo += 5;
  if (company.description) details.basicInfo += 5;
  if (company.website) details.basicInfo += 5;

  // Contact Information (20 points)
  if (company.phone) details.contactInfo += 5;
  if (company.address) details.contactInfo += 5;
  if (company.city) details.contactInfo += 5;
  if (company.state) details.contactInfo += 5;

  // Business Information (30 points)
  if (company.industry || enrichmentData?.sector) details.businessInfo += 10;
  if (company.annual_revenue || enrichmentData?.revenue) details.businessInfo += 10;
  if (company.company_size) details.businessInfo += 5;
  if (company.founded_year) details.businessInfo += 5;

  // Relationship Data (25 points)
  if (contactsCount > 0) details.relationshipData += 10;
  if (opportunitiesCount > 0) details.relationshipData += 10;
  if (company.last_contact_date) details.relationshipData += 5;

  score = details.basicInfo + details.contactInfo + details.businessInfo + details.relationshipData;

  // Determine color and icon based on score
  let color: string;
  let icon: string;
  
  if (score >= 70) {
    color = 'text-green-600';
    icon = '🟢';
  } else if (score >= 40) {
    color = 'text-yellow-600';
    icon = '🟠';
  } else {
    color = 'text-red-600';
    icon = '🔴';
  }

  return {
    score,
    color,
    icon,
    details
  };
};

export const formatRevenue = (revenue?: number): string => {
  if (!revenue) return '—';
  
  if (revenue >= 1000000) {
    return `€${(revenue / 1000000).toFixed(1)}M`;
  } else if (revenue >= 1000) {
    return `€${(revenue / 1000).toFixed(0)}K`;
  } else {
    return `€${revenue.toLocaleString()}`;
  }
};

export const formatLocation = (city?: string, state?: string): string => {
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  return '—';
};