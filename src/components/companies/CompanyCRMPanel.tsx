import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompanyStats {
  contactsCount: number;
  activeDealsCount: number;
  totalPipelineValue: number;
  isLoading: boolean;
  error: string | null;
}

interface CompanyCRMPanelProps {
  companyId: string;
  companyName: string;
  stats: CompanyStats;
}

export const CompanyCRMPanel = ({ companyId, companyName, stats }: CompanyCRMPanelProps) => {
  const { contactsCount, activeDealsCount, totalPipelineValue, isLoading, error } = stats;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Relación CRM</h3>
        </div>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Relación CRM</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contactos */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Contactos</span>
              </div>
              {contactsCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    // Navigate to contacts filtered by company
                    window.open(`/contacts?company=${encodeURIComponent(companyName)}`, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono">
                {isLoading ? '...' : contactsCount}
              </span>
              {contactsCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Activos
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Oportunidades activas */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Oportunidades</span>
              </div>
              {activeDealsCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    // Navigate to deals filtered by company
                    window.open(`/deals?company=${encodeURIComponent(companyName)}`, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono">
                {isLoading ? '...' : activeDealsCount}
              </span>
              {activeDealsCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Activas
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Valor total pipeline */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pipeline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono">
                {isLoading ? '...' : formatCurrency(totalPipelineValue)}
              </span>
              {totalPipelineValue > 0 && (
                <Badge variant="default" className="text-xs">
                  Total
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty state */}
      {!isLoading && contactsCount === 0 && activeDealsCount === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              Esta empresa aún no tiene actividad CRM
            </p>
            <p className="text-sm text-muted-foreground">
              Crea contactos y oportunidades para comenzar a gestionar la relación
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};