import React from 'react';
import { Company } from '@/types/Company';

interface CompaniesInlineStatsProps {
  companies: Company[];
  onStatClick?: (filter: string) => void;
}

export const CompaniesInlineStats = ({ companies, onStatClick }: CompaniesInlineStatsProps) => {
  const totalCompanies = companies.length;
  
  const companiesWithDeals = companies.filter(company => {
    const companyWithExtra = company as Company & { opportunities_count?: number };
    return (companyWithExtra.opportunities_count || 0) > 0;
  }).length;

  const totalPipelineValue = companies.reduce((sum, company) => {
    const companyWithExtra = company as Company & { total_deal_value?: number };
    return sum + (companyWithExtra.total_deal_value || 0);
  }, 0);

  const companiesNoActivity = companies.filter(company => {
    if (!company.last_contact_date) return true;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(company.last_contact_date) < thirtyDaysAgo;
  }).length;

  const formatPipelineValue = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toFixed(0)}`;
  };

  return (
    <div className="text-sm text-muted-foreground mb-4">
      <button 
        onClick={() => onStatClick?.('all')}
        className="hover:text-foreground transition-colors"
      >
        {totalCompanies} empresas
      </button>
      {' | '}
      <button 
        onClick={() => onStatClick?.('with_deals')}
        className="hover:text-foreground transition-colors"
      >
        {companiesWithDeals} con deals
      </button>
      {' | '}
      <button 
        onClick={() => onStatClick?.('pipeline')}
        className="hover:text-foreground transition-colors font-medium"
      >
        {formatPipelineValue(totalPipelineValue)} pipeline total
      </button>
      {' | '}
      <button 
        onClick={() => onStatClick?.('no_activity')}
        className="hover:text-foreground transition-colors"
      >
        {companiesNoActivity} sin actividad &gt;30d
      </button>
    </div>
  );
};