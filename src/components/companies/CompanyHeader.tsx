import { ArrowLeft, ChevronLeft, ChevronRight, Edit, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Company } from '@/types/Company';
import { EnrichmentButton } from './EnrichmentButton';

interface CompanyHeaderProps {
  company: Company;
  onEdit: (company: Company) => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const CompanyHeader = ({
  company,
  onEdit,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext
}: CompanyHeaderProps) => {
  const navigate = useNavigate();

  const getCompanyStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'activa': 'default',
      'cliente': 'default',
      'prospecto': 'secondary',
      'inactiva': 'outline',
      'perdida': 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const getCompanyTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      'cliente': 'default',
      'prospect': 'secondary',
      'partner': 'outline',
      'franquicia': 'outline',
      'competidor': 'destructive',
    };
    return variants[type] || 'secondary';
  };

  return (
    <div className="border-b border-border bg-background">
      <div className="px-6 py-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/empresas')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Empresas
            </Button>
            
            {/* Navigation between companies */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                disabled={!hasNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <EnrichmentButton company={company} />
            <Button onClick={() => onEdit(company)} className="gap-2">
              <Edit className="h-4 w-4" />
              Editar Empresa
            </Button>
          </div>
        </div>

        {/* Company Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold truncate">{company.name}</h1>
            </div>
            
            {/* Company info line */}
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <span>{company.industry || 'Industria no especificada'}</span>
              {company.city && (
                <>
                  <span>•</span>
                  <span>{company.city}</span>
                </>
              )}
              {company.website && (
                <>
                  <span>•</span>
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                </>
              )}
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2">
              <Badge variant={getCompanyStatusBadge(company.company_status)}>
                {company.company_status}
              </Badge>
              <Badge variant={getCompanyTypeBadge(company.company_type)}>
                {company.company_type}
              </Badge>
              {company.is_target_account && (
                <Badge variant="outline">Cuenta Objetivo</Badge>
              )}
              {company.is_key_account && (
                <Badge variant="outline">Cuenta Clave</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};