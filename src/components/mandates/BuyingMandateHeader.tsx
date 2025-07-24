import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { BuyingMandate } from '@/types/BuyingMandate';

interface BuyingMandateHeaderProps {
  mandate: BuyingMandate;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const BuyingMandateHeader = ({
  mandate,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext
}: BuyingMandateHeaderProps) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Activo', variant: 'default' as const },
      paused: { label: 'Pausado', variant: 'secondary' as const },
      completed: { label: 'Completado', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      compra: { label: 'Compra', variant: 'default' as const },
      venta: { label: 'Venta', variant: 'secondary' as const },
    };
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.compra;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Back Button and Title */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/mandatos')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Mandatos</span>
          </Button>
          
          <div className="border-l border-border h-6" />
          
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-foreground">
                {mandate.mandate_name}
              </h1>
              {getStatusBadge(mandate.status)}
              {getTypeBadge(mandate.mandate_type)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Cliente: {mandate.client_name} • {mandate.client_contact}
            </p>
          </div>
        </div>

        {/* Right Section - Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!hasNext}
            className="flex items-center space-x-1"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};