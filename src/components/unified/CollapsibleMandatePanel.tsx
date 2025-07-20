
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  Building2, 
  MapPin, 
  Euro, 
  Calendar,
  Users,
  Target,
  Plus,
  Eye
} from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { MandatoCriteria } from '@/components/mandates/MandatoCriteria';

interface CollapsibleMandatePanelProps {
  mandate: BuyingMandate;
  mandateType?: 'compra' | 'venta';
}

const CollapsibleMandatePanel: React.FC<CollapsibleMandatePanelProps> = ({ 
  mandate,
  mandateType = 'compra'
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    criteria: false,
    targets: true,
    activity: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-800 border-green-200' },
      paused: { label: 'Pausado', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      completed: { label: 'Completado', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800 border-red-200' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge className={`${config.className} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const SectionHeader: React.FC<{
    title: string;
    icon: React.ReactNode;
    sectionKey: string;
    count?: number;
  }> = ({ title, icon, sectionKey, count }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        {icon}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {count !== undefined && (
          <Badge variant="secondary" className="ml-2">
            {count}
          </Badge>
        )}
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Mandate Overview Card */}
      <Card>
        <SectionHeader
          title={`Información del ${mandateType === 'venta' ? 'Mandato de Venta' : 'Mandato'}`}
          icon={<Building2 className="h-5 w-5 text-primary" />}
          sectionKey="overview"
        />
        
        {expandedSections.overview && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Client Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-muted-foreground">Cliente</h4>
                <div>
                  <p className="font-semibold text-foreground">{mandate.client_name}</p>
                  <p className="text-sm text-muted-foreground">{mandate.client_contact}</p>
                  {mandate.client_email && (
                    <p className="text-sm text-muted-foreground">{mandate.client_email}</p>
                  )}
                  {mandate.client_phone && (
                    <p className="text-sm text-muted-foreground">{mandate.client_phone}</p>
                  )}
                </div>
              </div>

              {/* Status & Dates */}
              <div className="space-y-3">
                <h4 className="font-medium text-muted-foreground">Estado y Fechas</h4>
                <div className="space-y-2">
                  {getStatusBadge(mandate.status)}
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Inicio: {new Date(mandate.start_date).toLocaleDateString('es-ES')}</span>
                  </div>
                  {mandate.end_date && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Fin: {new Date(mandate.end_date).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Criteria Summary */}
              <div className="space-y-3">
                <h4 className="font-medium text-muted-foreground">{mandateType === 'venta' ? 'Valoración' : 'Criterios Financieros'}</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <span>Facturación: {formatCurrency(mandate.min_revenue)} - {formatCurrency(mandate.max_revenue)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <span>EBITDA: {formatCurrency(mandate.min_ebitda)} - {formatCurrency(mandate.max_ebitda)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sectors & Locations */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-muted-foreground mb-3">Sectores Objetivo</h4>
                <div className="flex flex-wrap gap-2">
                  {mandate.target_sectors && mandate.target_sectors.length > 0 ? (
                    mandate.target_sectors.map((sector, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                        {sector}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin sectores específicos</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-muted-foreground mb-3">Ubicaciones Objetivo</h4>
                <div className="flex flex-wrap gap-2">
                  {mandate.target_locations && mandate.target_locations.length > 0 ? (
                    mandate.target_locations.map((location, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-50 text-green-700">
                        <MapPin className="h-3 w-3 mr-1" />
                        {location}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin ubicaciones específicas</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Detailed Criteria Card */}
      <Card>
        <SectionHeader
          title="Criterios Detallados"
          icon={<Target className="h-5 w-5 text-primary" />}
          sectionKey="criteria"
        />
        
        {expandedSections.criteria && (
          <CardContent className="pt-0">
            <MandatoCriteria mandate={mandate} />
          </CardContent>
        )}
      </Card>

      {/* Targets Section */}
      <Card>
        <SectionHeader
          title={`${mandateType === 'venta' ? 'Compradores Potenciales' : 'Targets'}`}
          icon={<Users className="h-5 w-5 text-primary" />}
          sectionKey="targets"
          count={0}
        />
        
        {expandedSections.targets && (
          <CardContent className="pt-0">
            <div className="text-center py-12 space-y-4">
              <Target className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h4 className="text-lg font-medium text-foreground">
                  {mandateType === 'venta' ? 'No hay compradores potenciales identificados' : 'No hay targets identificados'}
                </h4>
                <p className="text-muted-foreground">
                  {mandateType === 'venta' 
                    ? 'Comienza agregando compradores potenciales interesados en esta oportunidad de venta'
                    : 'Comienza agregando empresas objetivo que cumplan con los criterios del mandato'
                  }
                </p>
              </div>
              <div className="flex justify-center space-x-3">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {mandateType === 'venta' ? 'Agregar Comprador' : 'Agregar Target'}
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Buscar en Base de Datos
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default CollapsibleMandatePanel;
