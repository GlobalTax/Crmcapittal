
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Target, 
  FileText,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { BuyingMandate } from '@/types/BuyingMandate';
import { ImprovedMandatesTable } from '@/components/mandates/ImprovedMandatesTable';
import CollapsibleMandatePanel from './CollapsibleMandatePanel';

type HierarchyLevel = 'leads' | 'companies' | 'mandates' | 'targets';

interface HierarchicalCRMViewProps {
  initialLevel: HierarchyLevel;
  mandateId?: string;
  mandateType?: 'compra' | 'venta';
}

export const HierarchicalCRMView: React.FC<HierarchicalCRMViewProps> = ({ 
  initialLevel, 
  mandateId,
  mandateType = 'compra'
}) => {
  const [currentLevel, setCurrentLevel] = useState<HierarchyLevel>(initialLevel);
  const [selectedMandate, setSelectedMandate] = useState<BuyingMandate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Use the mandateType prop to filter mandates
  const { mandates, isLoading } = useBuyingMandates(mandateType);

  const filteredMandates = mandates.filter(mandate => 
    mandate.mandate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mandate.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMandateSelect = (mandate: BuyingMandate) => {
    setSelectedMandate(mandate);
    setCurrentLevel('targets');
  };

  const handleBack = () => {
    if (currentLevel === 'targets') {
      setCurrentLevel('mandates');
      setSelectedMandate(null);
    }
  };

  const getLevelTitle = () => {
    switch (currentLevel) {
      case 'leads':
        return 'Leads';
      case 'companies':
        return 'Empresas';
      case 'mandates':
        return mandateType === 'venta' ? 'Mandatos de Venta' : 'Mandatos de Compra';
      case 'targets':
        return `Targets - ${selectedMandate?.mandate_name}`;
      default:
        return 'CRM Jerárquico';
    }
  };

  const getLevelIcon = () => {
    switch (currentLevel) {
      case 'leads':
        return <Users className="h-5 w-5" />;
      case 'companies':
        return <Building2 className="h-5 w-5" />;
      case 'mandates':
        return <FileText className="h-5 w-5" />;
      case 'targets':
        return <Target className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const renderBreadcrumb = () => (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <span>CRM</span>
      <span>/</span>
      <span className={currentLevel === 'mandates' ? 'text-foreground font-medium' : ''}>
        {mandateType === 'venta' ? 'Mandatos de Venta' : 'Mandatos de Compra'}
      </span>
      {currentLevel === 'targets' && (
        <>
          <span>/</span>
          <span className="text-foreground font-medium">Targets</span>
        </>
      )}
    </div>
  );

  if (currentLevel === 'mandates') {
    return (
      <div className="space-y-6">
        {renderBreadcrumb()}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getLevelIcon()}
            <h1 className="text-3xl font-bold tracking-tight">{getLevelTitle()}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar mandatos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo {mandateType === 'venta' ? 'Mandato de Venta' : 'Mandato'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Cargando mandatos...</div>
          </div>
        ) : (
          <ImprovedMandatesTable 
            mandates={filteredMandates} 
            onRefresh={() => window.location.reload()}
          />
        )}
      </div>
    );
  }

  if (currentLevel === 'targets' && selectedMandate) {
    return (
      <div className="space-y-6">
        {renderBreadcrumb()}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            {getLevelIcon()}
            <h1 className="text-3xl font-bold tracking-tight">{getLevelTitle()}</h1>
          </div>
        </div>

        <CollapsibleMandatePanel 
          mandate={selectedMandate}
          mandateType={mandateType}
        />
      </div>
    );
  }

  // Fallback for other levels
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getLevelIcon()}
          <span>{getLevelTitle()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Esta vista está en desarrollo. Por favor, selecciona "Mandatos" desde el menú principal.
        </p>
      </CardContent>
    </Card>
  );
};
