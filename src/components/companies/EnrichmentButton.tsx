import { Button } from '@/components/ui/button';
import { RefreshCw, Building2 } from 'lucide-react';
import { useEinformaEnrichment } from '@/hooks/useEinformaEnrichment';
import { Company } from '@/types/Company';

interface EnrichmentButtonProps {
  company: Company;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const EnrichmentButton = ({ 
  company, 
  variant = 'outline', 
  size = 'sm',
  className = ''
}: EnrichmentButtonProps) => {
  const { enrichCompany, isEnriching } = useEinformaEnrichment();

  const handleEnrich = () => {
    if (!company.nif) {
      return;
    }
    enrichCompany({ companyId: company.id, nif: company.nif });
  };

  const isDisabled = !company.nif || isEnriching;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleEnrich}
      disabled={isDisabled}
      className={className}
    >
      {isEnriching ? (
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Building2 className="h-4 w-4 mr-2" />
      )}
      {isEnriching ? 'Enriqueciendo...' : 'Enriquecer con eInforma'}
    </Button>
  );
};