import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  TrendingUp,
  Building2,
  Target,
  Edit,
  Euro,
  MapPin
} from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';

interface CollapsibleMandatePanelProps {
  mandate: BuyingMandate;
  onEdit: (mandate: BuyingMandate) => void;
  onUpdate?: (mandate: BuyingMandate) => void;
}

export const CollapsibleMandatePanel = ({ mandate, onEdit, onUpdate }: CollapsibleMandatePanelProps) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: BuyingMandate['status']) => {
    const statusConfig = {
      active: { label: 'Activo', variant: 'default' as const },
      paused: { label: 'Pausado', variant: 'secondary' as const },
      completed: { label: 'Completado', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatRange = (min?: number, max?: number) => {
    if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    if (min) return `Desde ${formatCurrency(min)}`;
    if (max) return `Hasta ${formatCurrency(max)}`;
    return 'No especificado';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{mandate.mandate_name}</h1>
          <p className="text-muted-foreground">
            Mandato de compra - {mandate.client_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(mandate.status)}
          <Button variant="outline" size="sm" onClick={() => onEdit(mandate)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturación Objetivo</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatRange(mandate.min_revenue, mandate.max_revenue)}
            </div>
            <p className="text-xs text-muted-foreground">Rango buscado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EBITDA Objetivo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatRange(mandate.min_ebitda, mandate.max_ebitda)}
            </div>
            <p className="text-xs text-muted-foreground">Rango buscado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sectores</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{mandate.target_sectors.length}</div>
            <p className="text-xs text-muted-foreground">
              {mandate.target_sectors.slice(0, 2).join(', ')}
              {mandate.target_sectors.length > 2 && ` +${mandate.target_sectors.length - 2}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {Math.ceil((new Date(mandate.end_date || new Date()).getTime() - new Date(mandate.start_date).getTime()) / (1000 * 60 * 60 * 24))} días
            </div>
            <p className="text-xs text-muted-foreground">
              Desde {formatDate(mandate.start_date)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Cliente</h4>
              <p className="text-sm text-muted-foreground">{mandate.client_name}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Contacto Principal</h4>
              <p className="text-sm text-muted-foreground">{mandate.client_contact}</p>
            </div>
            {mandate.client_email && (
              <div>
                <h4 className="font-medium mb-2">Email</h4>
                <a 
                  href={`mailto:${mandate.client_email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {mandate.client_email}
                </a>
              </div>
            )}
            {mandate.client_phone && (
              <div>
                <h4 className="font-medium mb-2">Teléfono</h4>
                <a 
                  href={`tel:${mandate.client_phone}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {mandate.client_phone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Criterios de Búsqueda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Sectores Objetivo</h4>
              <div className="flex flex-wrap gap-1">
                {mandate.target_sectors.map((sector) => (
                  <Badge key={sector} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
              </div>
            </div>
            
            {mandate.target_locations && mandate.target_locations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Ubicaciones</h4>
                <div className="flex flex-wrap gap-1">
                  {mandate.target_locations.map((location) => (
                    <Badge key={location} variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {mandate.other_criteria && (
              <div>
                <h4 className="font-medium mb-2">Otros Criterios</h4>
                <p className="text-sm text-muted-foreground">{mandate.other_criteria}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/mandatos/${mandate.id}`)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Vista Clásica
        </Button>
        <Button onClick={() => navigate(`/mandatos/${mandate.id}/vista-detallada`)}>
          <Target className="h-4 w-4 mr-2" />
          Vista Detallada
        </Button>
      </div>
    </div>
  );
};
