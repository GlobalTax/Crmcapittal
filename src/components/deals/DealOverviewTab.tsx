import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/types/Deal';
import { Building2, Calendar, Target, TrendingUp, DollarSign, Users } from 'lucide-react';

interface DealOverviewTabProps {
  deal: Deal;
}

export const DealOverviewTab = ({ deal }: DealOverviewTabProps) => {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Lead': return 'hsl(213, 94%, 68%)';
      case 'In Progress': return 'hsl(45, 93%, 47%)';
      case 'Won': return 'hsl(158, 100%, 38%)';
      case 'Lost': return 'hsl(4, 86%, 63%)';
      default: return 'hsl(210, 11%, 71%)';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Deal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Información de la Oportunidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre de la Oportunidad</label>
              <p className="text-sm mt-1">{deal.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Etapa</label>
              <div className="mt-1">
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: getStageColor(deal.stage),
                    color: getStageColor(deal.stage)
                  }}
                >
                  {deal.stage}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Valor de la Oportunidad</label>
              <p className="text-sm mt-1 font-medium text-success">
                {formatCurrency(deal.amount)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Probabilidad</label>
              <p className="text-sm mt-1">{deal.probability}%</p>
            </div>
          </div>
          
          {/* Probability Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">Probabilidad de Éxito</label>
              <span className="text-sm font-medium" style={{ color: getStageColor(deal.stage) }}>
                {deal.probability}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${deal.probability}%`,
                  backgroundColor: getStageColor(deal.stage)
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      {deal.company && (
        <Card>
          <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información de la Empresa
          </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nombre de la Empresa</label>
                <p className="text-sm mt-1">{deal.company.name}</p>
              </div>
              {deal.company.industry && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Industria</label>
                  <p className="text-sm mt-1">{deal.company.industry}</p>
                </div>
              )}
              {deal.company.website && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sitio Web</label>
                  <p className="text-sm mt-1">
                    <a 
                      href={deal.company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {deal.company.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronología
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Creado</label>
              <p className="text-sm mt-1">{formatDate(deal.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
              <p className="text-sm mt-1">{formatDate(deal.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Métricas de la Oportunidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">
                {deal.amount ? formatCurrency(deal.amount) : '€0'}
              </p>
              <p className="text-sm text-muted-foreground">Valor de la Oportunidad</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{deal.probability}%</p>
              <p className="text-sm text-muted-foreground">Probabilidad</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">
                {Math.ceil((new Date().getTime() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
              </p>
              <p className="text-sm text-muted-foreground">Días Activo</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">1</p>
              <p className="text-sm text-muted-foreground">Involucrados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps (if deal is active) */}
      {deal.stage !== 'Won' && deal.stage !== 'Lost' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Pasos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div>
                  <p className="font-medium text-sm">Seguimiento con involucrados</p>
                  <p className="text-xs text-muted-foreground">Programar próxima reunión o llamada</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                <div>
                  <p className="font-medium text-sm">Preparar propuesta</p>
                  <p className="text-xs text-muted-foreground">Borrador del documento de propuesta inicial</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                <div>
                  <p className="font-medium text-sm">Negociar términos</p>
                  <p className="text-xs text-muted-foreground">Discutir precios y cronograma</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};