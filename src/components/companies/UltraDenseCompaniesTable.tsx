import React from 'react';
import { Company } from '@/types/Company';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Mail, ExternalLink } from 'lucide-react';
import { StackedAvatars } from './StackedAvatars';
import { CompanyQuickActions } from './CompanyQuickActions';
import { EmptyStateSmall } from '@/components/ui/EmptyStateSmall';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UltraDenseCompaniesTableProps {
  companies: Company[];
  onCompanyClick: (company: Company) => void;
  onCreateCompany: () => void;
  onCreateDeal: (company: Company) => void;
  onCreateContact: (company: Company) => void;
  onViewEinforma: (company: Company) => void;
  isLoading?: boolean;
}

export const UltraDenseCompaniesTable = ({
  companies,
  onCompanyClick,
  onCreateCompany,
  onCreateDeal,
  onCreateContact,
  onViewEinforma,
  isLoading
}: UltraDenseCompaniesTableProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const formatPipelineValue = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toFixed(0)}`;
  };

  const formatActivity = (date?: string) => {
    if (!date) return 'Sin actividad';
    
    const activityDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - activityDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'hace 1 día';
    if (diffDays < 7) return `hace ${diffDays} días`;
    if (diffDays < 30) return `hace ${Math.ceil(diffDays / 7)} sem`;
    return `hace ${Math.ceil(diffDays / 30)} meses`;
  };

  if (companies.length === 0 && !isLoading) {
    return (
      <div className="bg-background rounded-lg border border-border">
        <div className="p-6">
          <EmptyStateSmall
            icon={<Building2 className="w-5 h-5 text-primary" />}
            text="No hay empresas aún"
            action={<Button onClick={onCreateCompany}>+ Nueva Empresa</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-[40%]">
                Empresa
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-[25%]">
                Pipeline
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-[20%]">
                Contactos
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-[15%]">
                Actividad
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => {
              const companyWithExtra = company as Company & { 
                opportunities_count?: number;
                contacts_count?: number;
                total_deal_value?: number;
                sector?: string;
              };
              
              return (
                <tr
                  key={company.id}
                  className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors h-14 group"
                  onClick={() => onCompanyClick(company)}
                >
                  {/* EMPRESA (40%) */}
                  <td className="px-6 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-muted text-xs font-medium">
                          {getInitials(company.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-foreground truncate">
                          {company.name}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {companyWithExtra.sector || company.industry || 'Sin sector'} • {company.company_size || 'Tamaño no definido'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* PIPELINE (25%) */}
                  <td className="px-6 py-2">
                    <div className="space-y-1">
                      <button 
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Filter to deals
                        }}
                      >
                        {companyWithExtra.opportunities_count || 0} deals activos
                      </button>
                      <div className="font-bold text-sm text-emerald-600">
                        {formatPipelineValue(companyWithExtra.total_deal_value || 0)}
                      </div>
                    </div>
                  </td>

                  {/* CONTACTOS (20%) */}
                  <td className="px-6 py-2">
                    <div className="space-y-1">
                      <StackedAvatars 
                        companyId={company.id!} 
                        maxVisible={4}
                      />
                      <div className="text-sm text-muted-foreground">
                        {companyWithExtra.contacts_count || 0} contactos
                      </div>
                    </div>
                  </td>

                  {/* ACTIVIDAD (15%) */}
                  <td className="px-6 py-2">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Último contacto: {formatActivity(company.last_contact_date)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {company.owner_name && (
                          <span>por {company.owner_name}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* QUICK ACTIONS - Solo visible en hover */}
                  <td className="px-6 py-2 w-0">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CompanyQuickActions
                        company={company}
                        onCreateDeal={onCreateDeal}
                        onCreateContact={onCreateContact}
                        onViewEinforma={onViewEinforma}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};