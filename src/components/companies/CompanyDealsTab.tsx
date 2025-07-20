import { useState } from 'react';
import { Briefcase, Plus, Euro, Calendar, TrendingUp, AlertTriangle as AlertTriangleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeals } from '@/hooks/useDeals';
import { Company } from '@/types/Company';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NewDealModal } from '@/components/deals/NewDealModal';
import { useNavigate } from 'react-router-dom';

interface CompanyDealsTabProps {
  company: Company;
}

export const CompanyDealsTab = ({ company }: CompanyDealsTabProps) => {
  const { deals, loading, error } = useDeals();
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const navigate = useNavigate();

  // Add error handling
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangleIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Error al cargar las oportunidades</p>
          <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const companyDeals = deals?.filter(deal => 
    deal.companyId === company.id ||
    deal.company?.name?.toLowerCase().includes(company.name.toLowerCase())
  ) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (stage: string) => {
    switch (stage) {
      case 'Won': return 'default';
      case 'In Progress': return 'secondary';
      case 'Lost': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (companyDeals.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Aún no hay oportunidades"
        subtitle="Crea oportunidades para esta empresa para hacer seguimiento"
        action={{
          label: "Crear Oportunidad",
          onClick: () => setShowNewDealModal(true)
        }}
      />
    );
  }

  const totalValue = companyDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const activeDealsCount = companyDeals.filter(deal => deal.stage !== 'Lost').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-neutral-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Total Oportunidades</span>
          </div>
          <span className="text-2xl font-bold">{companyDeals.length}</span>
        </div>

        <div className="p-4 bg-neutral-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Oportunidades Activas</span>
          </div>
          <span className="text-2xl font-bold text-green-600">{activeDealsCount}</span>
        </div>

        <div className="p-4 bg-neutral-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Valor Total</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalValue)}
          </span>
        </div>
      </div>

      {/* Deals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Oportunidades</h3>
          <Button onClick={() => setShowNewDealModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Oportunidad
          </Button>
        </div>

        <div className="grid gap-4">
          {companyDeals.map((deal) => (
            <div key={deal.id} className="p-4 border border-border rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{deal.title}</h4>
                    <Badge variant={getPriorityColor(deal.stage)}>
                      {deal.stage}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {deal.amount && (
                      <div className="flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        <span>{formatCurrency(deal.amount)}</span>
                      </div>
                    )}
                    <span>Probabilidad: {deal.probability}%</span>
                    {deal.company?.name && (
                      <span>Empresa: {deal.company.name}</span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    Creado: {new Date(deal.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/negocios?dealId=${deal.id}`)}
                  >
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/negocios?dealId=${deal.id}&edit=true`)}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NewDealModal
        open={showNewDealModal}
        onOpenChange={setShowNewDealModal}
        defaultStage="Lead"
        defaultCompanyId={company.id}
      />
    </div>
  );
};