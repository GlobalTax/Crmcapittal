import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, MapPin, Eye, DollarSign } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MandateCardProps {
  mandate: BuyingMandate;
  onSelect: () => void;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'paused':
      return 'secondary';
    case 'completed':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'paused':
      return 'Pausado';
    case 'completed':
      return 'Completado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'compra':
      return 'Compra';
    case 'venta':
      return 'Venta';
    default:
      return type;
  }
};

export const MandateCard = ({ mandate, onSelect }: MandateCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {mandate.client_name || 'Sin nombre'}
          </CardTitle>
          <Badge variant={getStatusVariant(mandate.status)}>
            {getStatusLabel(mandate.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Type and Revenue */}
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <Badge variant="outline" className="mr-2">
              {getTypeLabel(mandate.mandate_type)}
            </Badge>
          </div>
          {mandate.min_revenue && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>
                {mandate.min_revenue.toLocaleString()}
                {mandate.max_revenue && ` - ${mandate.max_revenue.toLocaleString()}`}
              </span>
            </div>
          )}
        </div>

        {/* Location */}
        {mandate.target_locations && mandate.target_locations.length > 0 && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="line-clamp-1">{mandate.target_locations.join(', ')}</span>
          </div>
        )}

        {/* Sectors */}
        {mandate.target_sectors && mandate.target_sectors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {mandate.target_sectors.slice(0, 3).map((sector, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {sector}
              </Badge>
            ))}
            {mandate.target_sectors.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{mandate.target_sectors.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Date */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {format(new Date(mandate.created_at), 'dd MMM yyyy', { locale: es })}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};