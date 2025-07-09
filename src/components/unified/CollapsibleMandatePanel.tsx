import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  TrendingUp,
  Building2,
  Target
} from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';

interface CollapsibleMandatePanelProps {
  mandate: BuyingMandate;
  onEdit: (mandate: BuyingMandate) => void;
  onUpdate?: (mandate: BuyingMandate) => void;
  onViewTargets?: (mandate: BuyingMandate) => void;
}

export const CollapsibleMandatePanel = ({ mandate, onEdit, onUpdate, onViewTargets }: CollapsibleMandatePanelProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

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

  return (
    <Card className="relative">
      {/* Floating Edit Button */}
      <Button
        size="sm"
        className="absolute top-4 right-4 z-10 h-8 w-8 p-0 shadow-md"
        onClick={() => onEdit(mandate)}
      >
        <Edit className="h-4 w-4" />
      </Button>

      <CardHeader className="pb-4 pr-16">
        <CardTitle className="flex items-center gap-3">
          <FileText className="h-5 w-5" />
          <span className="text-lg">{mandate.mandate_name}</span>
          {getStatusBadge(mandate.status)}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Essential Information - Always Visible */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Cliente: <span className="font-medium">{mandate.client_name}</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Inicio: {formatDate(mandate.start_date)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>Sectores: {mandate.target_sectors.slice(0, 2).join(', ')}</span>
              {mandate.target_sectors.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{mandate.target_sectors.length - 2}
                </Badge>
              )}
            </div>
            {onViewTargets && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewTargets(mandate)}
                className="text-xs h-7"
              >
                <Target className="h-3 w-3 mr-1" />
                Ver Targets
              </Button>
            )}
          </div>
        </div>

        {/* Client Information - Collapsible */}
        <Collapsible
          open={expandedSections.has('client')}
          onOpenChange={() => toggleSection('client')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Información del Cliente</span>
            </div>
            {expandedSections.has('client') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-muted/30 p-4 rounded-md space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Contacto: {mandate.client_contact}</span>
              </div>
              {mandate.client_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${mandate.client_email}`} className="text-sm text-blue-600 hover:underline">
                    {mandate.client_email}
                  </a>
                </div>
              )}
              {mandate.client_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${mandate.client_phone}`} className="text-sm text-blue-600 hover:underline">
                    {mandate.client_phone}
                  </a>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Financial Criteria - Collapsible */}
        {(mandate.min_revenue || mandate.max_revenue || mandate.min_ebitda || mandate.max_ebitda) && (
          <Collapsible
            open={expandedSections.has('financial')}
            onOpenChange={() => toggleSection('financial')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Criterios Financieros</span>
              </div>
              {expandedSections.has('financial') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-muted/30 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Rango Facturación</span>
                    <div className="font-medium text-sm">
                      {mandate.min_revenue && mandate.max_revenue ? (
                        <>
                          {formatCurrency(mandate.min_revenue)} - {formatCurrency(mandate.max_revenue)}
                        </>
                      ) : mandate.min_revenue ? (
                        <>Desde {formatCurrency(mandate.min_revenue)}</>
                      ) : mandate.max_revenue ? (
                        <>Hasta {formatCurrency(mandate.max_revenue)}</>
                      ) : (
                        'No especificado'
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Rango EBITDA</span>
                    <div className="font-medium text-sm">
                      {mandate.min_ebitda && mandate.max_ebitda ? (
                        <>
                          {formatCurrency(mandate.min_ebitda)} - {formatCurrency(mandate.max_ebitda)}
                        </>
                      ) : mandate.min_ebitda ? (
                        <>Desde {formatCurrency(mandate.min_ebitda)}</>
                      ) : mandate.max_ebitda ? (
                        <>Hasta {formatCurrency(mandate.max_ebitda)}</>
                      ) : (
                        'No especificado'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Target Criteria - Collapsible */}
        <Collapsible
          open={expandedSections.has('criteria')}
          onOpenChange={() => toggleSection('criteria')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="font-medium">Criterios de Búsqueda</span>
            </div>
            {expandedSections.has('criteria') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-muted/30 p-4 rounded-md space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Sectores Objetivo</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {mandate.target_sectors.map((sector) => (
                    <Badge key={sector} variant="outline" className="text-xs">
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>
              {mandate.target_locations.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Ubicaciones Objetivo</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mandate.target_locations.map((location) => (
                      <Badge key={location} variant="outline" className="text-xs">
                        📍 {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Other Criteria - Collapsible */}
        {mandate.other_criteria && (
          <Collapsible
            open={expandedSections.has('other')}
            onOpenChange={() => toggleSection('other')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Otros Criterios</span>
              </div>
              {expandedSections.has('other') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-muted/30 p-4 rounded-md">
                <p className="text-sm">{mandate.other_criteria}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Metadata */}
        <Separator />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Inicio: {formatDate(mandate.start_date)}</span>
          {mandate.end_date && (
            <span>Fin: {formatDate(mandate.end_date)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
