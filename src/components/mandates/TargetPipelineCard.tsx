import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Building2, User, TrendingUp, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MandateTarget } from '@/types/BuyingMandate';

interface TargetPipelineCardProps {
  target: MandateTarget;
  onClick: () => void;
}

export const TargetPipelineCard = ({ target, onClick }: TargetPipelineCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: target.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return null;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMainKPI = () => {
    if (target.revenues) {
      return {
        label: 'Facturación',
        value: formatCurrency(target.revenues),
        icon: TrendingUp,
      };
    }
    if (target.ebitda) {
      return {
        label: 'EBITDA',
        value: formatCurrency(target.ebitda),
        icon: TrendingUp,
      };
    }
    return null;
  };

  const mainKPI = getMainKPI();

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-3">
        {/* Company Name */}
        <div className="flex items-start space-x-2">
          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm truncate">{target.company_name}</h4>
            {target.sector && (
              <p className="text-xs text-muted-foreground truncate">{target.sector}</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        {target.contact_name && (
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {target.contact_name}
            </span>
          </div>
        )}

        {/* Location */}
        {target.location && (
          <div className="flex items-center space-x-2">
            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {target.location}
            </span>
          </div>
        )}

        {/* Main KPI */}
        {mainKPI && (
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <div className="flex items-center space-x-1">
              <mainKPI.icon className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground">{mainKPI.label}</span>
            </div>
            <span className="text-xs font-medium">{mainKPI.value}</span>
          </div>
        )}

        {/* Contact Status */}
        <div className="flex items-center justify-between">
          <Badge
            variant={target.contacted ? 'default' : 'secondary'}
            className="text-xs"
          >
            {target.contacted ? 'Contactado' : 'Sin contactar'}
          </Badge>
          {target.contact_date && (
            <span className="text-xs text-muted-foreground">
              {new Date(target.contact_date).toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};