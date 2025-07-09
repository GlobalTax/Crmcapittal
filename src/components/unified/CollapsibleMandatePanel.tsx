import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  TrendingUp,
  Building2,
  Target
} from 'lucide-react';
import { FloatingEditButton } from './collapsible/FloatingEditButton';
import { EntityHeader } from './collapsible/EntityHeader';
import { EssentialInfo, EssentialField } from './collapsible/EssentialInfo';
import { CollapsibleSection } from './collapsible/CollapsibleSection';
import { BuyingMandate } from '@/types/BuyingMandate';

interface CollapsibleMandatePanelProps {
  mandate: BuyingMandate;
  onEdit: (mandate: BuyingMandate) => void;
  onUpdate?: (mandate: BuyingMandate) => void;
}

export const CollapsibleMandatePanel = ({ mandate, onEdit, onUpdate }: CollapsibleMandatePanelProps) => {
  const navigate = useNavigate();
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
      <FloatingEditButton onClick={() => onEdit(mandate)} />
      
      <EntityHeader
        icon={<FileText className="h-5 w-5" />}
        title={mandate.mandate_name}
        badge={getStatusBadge(mandate.status)}
      />

      <CardContent className="space-y-4">
        {/* Essential Information - Always Visible */}
        <EssentialInfo>
          <div className="space-y-2">
            <EssentialField 
              icon={<User className="h-4 w-4 text-muted-foreground" />} 
              label="Cliente"
              value={mandate.client_name} 
            />
            <EssentialField 
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />} 
              label="Inicio"
              value={formatDate(mandate.start_date)} 
            />
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/mandatos/${mandate.id}`)}
              className="text-xs h-7"
            >
              <Target className="h-3 w-3 mr-1" />
              Ver Mandato
            </Button>
          </div>
        </EssentialInfo>

        {/* Client Information - Collapsible */}
        <CollapsibleSection
          title="Información del Cliente"
          icon={<User className="h-4 w-4" />}
          isOpen={expandedSections.has('client')}
          onToggle={() => toggleSection('client')}
        >
          <div className="space-y-3">
            <EssentialField 
              icon={<User className="h-4 w-4 text-muted-foreground" />} 
              label="Contacto"
              value={mandate.client_contact} 
            />
            {mandate.client_email && (
              <EssentialField 
                icon={<Mail className="h-4 w-4 text-muted-foreground" />} 
                value={mandate.client_email}
                href={`mailto:${mandate.client_email}`}
              />
            )}
            {mandate.client_phone && (
              <EssentialField 
                icon={<Phone className="h-4 w-4 text-muted-foreground" />} 
                value={mandate.client_phone}
                href={`tel:${mandate.client_phone}`}
              />
            )}
          </div>
        </CollapsibleSection>

        {/* Financial Criteria - Collapsible */}
        {(mandate.min_revenue || mandate.max_revenue || mandate.min_ebitda || mandate.max_ebitda) && (
          <CollapsibleSection
            title="Criterios Financieros"
            icon={<TrendingUp className="h-4 w-4" />}
            isOpen={expandedSections.has('financial')}
            onToggle={() => toggleSection('financial')}
          >
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
          </CollapsibleSection>
        )}

        {/* Target Criteria - Collapsible */}
        <CollapsibleSection
          title="Criterios de Búsqueda"
          icon={<Target className="h-4 w-4" />}
          isOpen={expandedSections.has('criteria')}
          onToggle={() => toggleSection('criteria')}
        >
          <div className="space-y-3">
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
        </CollapsibleSection>

        {/* Other Criteria - Collapsible */}
        {mandate.other_criteria && (
          <CollapsibleSection
            title="Otros Criterios"
            icon={<FileText className="h-4 w-4" />}
            isOpen={expandedSections.has('other')}
            onToggle={() => toggleSection('other')}
          >
            <p className="text-sm">{mandate.other_criteria}</p>
          </CollapsibleSection>
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
