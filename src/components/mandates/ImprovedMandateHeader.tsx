
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock,
  Edit,
  ExternalLink,
  FileText
} from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';

interface ImprovedMandateHeaderProps {
  mandate: BuyingMandate;
  totalTargets?: number;
  contactedTargets?: number;
  interestedTargets?: number;
  onEdit: (mandate: BuyingMandate) => void;
}

export const ImprovedMandateHeader = ({ 
  mandate, 
  totalTargets = 0,
  contactedTargets = 0,
  interestedTargets = 0,
  onEdit 
}: ImprovedMandateHeaderProps) => {
  const getStatusBadge = (status: BuyingMandate['status']) => {
    const statusConfig = {
      active: { label: 'Activo', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      paused: { label: 'Pausado', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completado', variant: 'outline' as const, color: 'bg-blue-100 text-blue-800' },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateProgress = () => {
    if (totalTargets === 0) return 0;
    return Math.round((contactedTargets / totalTargets) * 100);
  };

  const getDaysActive = () => {
    const startDate = new Date(mandate.start_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const progress = calculateProgress();

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>Mandatos de Compra</span>
          <span>/</span>
          <span className="text-foreground font-medium">{mandate.mandate_name}</span>
        </div>

        {/* Main Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {mandate.mandate_name}
              </h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>Cliente: <span className="font-medium text-foreground">{mandate.client_name}</span></span>
                <span>•</span>
                <span>Contacto: <span className="font-medium text-foreground">{mandate.client_contact}</span></span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                {getStatusBadge(mandate.status)}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Creado {formatDate(mandate.created_at)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {getDaysActive()} días activo
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(mandate)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Portal Cliente
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Targets Totales</p>
                  <p className="text-2xl font-bold text-foreground">{totalTargets}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contactados</p>
                  <p className="text-2xl font-bold text-green-600">{contactedTargets}</p>
                  <p className="text-xs text-muted-foreground">{progress}% del total</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Interesados</p>
                  <p className="text-2xl font-bold text-orange-600">{interestedTargets}</p>
                  <p className="text-xs text-muted-foreground">
                    {contactedTargets > 0 ? Math.round((interestedTargets / contactedTargets) * 100) : 0}% conversión
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Progreso</p>
                  <p className="text-2xl font-bold text-primary">{progress}%</p>
                  <Progress value={progress} className="h-2 mt-1" />
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mandate Criteria Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 text-foreground">Sectores Objetivo</h4>
              <div className="flex flex-wrap gap-1">
                {mandate.target_sectors.map((sector, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 text-foreground">Criterios Financieros</h4>
              <div className="space-y-1 text-sm">
                {mandate.min_revenue && (
                  <div>Facturación mín: <span className="font-medium">€{mandate.min_revenue.toLocaleString()}</span></div>
                )}
                {mandate.max_revenue && (
                  <div>Facturación máx: <span className="font-medium">€{mandate.max_revenue.toLocaleString()}</span></div>
                )}
                {mandate.min_ebitda && (
                  <div>EBITDA mín: <span className="font-medium">€{mandate.min_ebitda.toLocaleString()}</span></div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 text-foreground">Timeline</h4>
              <div className="space-y-1 text-sm">
                <div>Inicio: <span className="font-medium">{formatDate(mandate.start_date)}</span></div>
                {mandate.end_date && (
                  <div>Fin previsto: <span className="font-medium">{formatDate(mandate.end_date)}</span></div>
                )}
                <div className="text-muted-foreground">Activo desde hace {getDaysActive()} días</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
