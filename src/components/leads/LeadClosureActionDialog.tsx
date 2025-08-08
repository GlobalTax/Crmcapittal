import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, User, Calculator, Target, ArrowRight } from 'lucide-react';
import { Lead } from '@/types/Lead';
import { analyticsService } from '@/services/analyticsService';
import { useToast } from '@/hooks/use-toast';

interface LeadClosureActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onCreateFromLead: (leadId: string, type: string, payload: any, linkToLead: boolean) => Promise<{ success: boolean; id?: string; error?: string }>;
}

type ClosureType = 'mandato_venta' | 'mandato_compra' | 'valoracion' | null;

interface PayloadData {
  // Common fields
  company_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  
  // Mandate specific
  mandate_type?: 'sell' | 'buy';
  sector?: string;
  ebitda_range?: string;
  location?: string;
  
  // Valuation specific
  valuation_purpose?: string;
  company_stage?: string;
  revenue_range?: string;
}

const KEYWORD_RULES = {
  sell_keywords: ['vender', 'venta', 'sell', 'exit', 'salida', 'desinversion', 'liquidar'],
  buy_keywords: ['comprar', 'compra', 'buy', 'adquisicion', 'merger', 'fusion', 'inversion'],
  valuation_keywords: ['valorar', 'valoracion', 'valuation', 'tasacion', 'precio', 'worth']
};

export const LeadClosureActionDialog = ({
  isOpen,
  onClose,
  lead,
  onCreateFromLead
}: LeadClosureActionDialogProps) => {
  const [selectedType, setSelectedType] = useState<ClosureType>(null);
  const [payloadData, setPayloadData] = useState<PayloadData>({});
  const [linkToLead, setLinkToLead] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Suggest recommended type based on lead data
  const suggest = (lead: Lead): ClosureType => {
    const searchText = `${lead.message || ''} ${lead.service_type || ''} ${lead.extra?.notes || ''}`.toLowerCase();
    
    let sellScore = 0;
    let buyScore = 0;
    let valuationScore = 0;
    
    KEYWORD_RULES.sell_keywords.forEach(keyword => {
      if (searchText.includes(keyword)) sellScore++;
    });
    
    KEYWORD_RULES.buy_keywords.forEach(keyword => {
      if (searchText.includes(keyword)) buyScore++;
    });
    
    KEYWORD_RULES.valuation_keywords.forEach(keyword => {
      if (searchText.includes(keyword)) valuationScore++;
    });
    
    // Use service_type as strong signal
    if (lead.service_type === 'mandato_venta') sellScore += 3;
    if (lead.service_type === 'mandato_compra') buyScore += 3;
    if (lead.service_type === 'valoracion_empresa') valuationScore += 3;
    
    if (sellScore >= buyScore && sellScore >= valuationScore) return 'mandato_venta';
    if (buyScore >= valuationScore) return 'mandato_compra';
    return 'valoracion';
  };

  // Build payload with pre-filled data
  const buildPayload = (type: ClosureType, data: PayloadData, lead: Lead) => {
    const basePayload = {
      company_name: data.company_name || lead.company || '',
      contact_name: data.contact_name || lead.name || '',
      contact_email: data.contact_email || lead.email || '',
      contact_phone: data.contact_phone || lead.phone || '',
      source_lead_id: lead.id,
      created_from_lead: true
    };

    switch (type) {
      case 'mandato_venta':
        return {
          ...basePayload,
          mandate_type: 'sell',
          sector: data.sector || '',
          ebitda_range: data.ebitda_range || '',
          location: data.location || '',
          status: 'draft'
        };
        
      case 'mandato_compra':
        return {
          ...basePayload,
          mandate_type: 'buy',
          sector: data.sector || '',
          ebitda_range: data.ebitda_range || '',
          location: data.location || '',
          status: 'draft'
        };
        
      case 'valoracion':
        return {
          ...basePayload,
          valuation_purpose: data.valuation_purpose || '',
          company_stage: data.company_stage || '',
          revenue_range: data.revenue_range || '',
          status: 'pending'
        };
        
      default:
        return basePayload;
    }
  };

  // Initialize recommended type on open
  useEffect(() => {
    if (isOpen && lead) {
      const recommended = suggest(lead);
      setSelectedType(recommended);
      
      // Pre-fill common data
      setPayloadData({
        company_name: lead.company || '',
        contact_name: lead.name || '',
        contact_email: lead.email || '',
        contact_phone: lead.phone || ''
      });

      // Track dialog opened
      analyticsService.track('lead_closure_dialog_opened', {
        lead_id: lead.id,
        recommended_type: recommended,
        lead_source: lead.source,
        timestamp: Date.now()
      });
    }
  }, [isOpen, lead]);

  const handleCreate = async () => {
    if (!selectedType) return;

    setIsCreating(true);
    
    try {
      const payload = buildPayload(selectedType, payloadData, lead);
      
      // Track creation attempt
      analyticsService.track('lead_closure_creation_started', {
        lead_id: lead.id,
        type: selectedType,
        link_to_lead: linkToLead,
        timestamp: Date.now()
      });

      const result = await onCreateFromLead(lead.id, selectedType, payload, linkToLead);
      
      if (result.success) {
        // Track success
        analyticsService.track('lead_closure_creation_success', {
          lead_id: lead.id,
          type: selectedType,
          created_id: result.id,
          link_to_lead: linkToLead,
          timestamp: Date.now()
        });

        toast({
          title: "Creado exitosamente",
          description: `${getTypeLabel(selectedType)} creado desde el lead`,
        });

        onClose();
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      // Track error
      analyticsService.track('lead_closure_creation_error', {
        lead_id: lead.id,
        type: selectedType,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });

      toast({
        title: "Error",
        description: "No se pudo crear el elemento. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getTypeLabel = (type: ClosureType) => {
    switch (type) {
      case 'mandato_venta': return 'Mandato de Venta';
      case 'mandato_compra': return 'Mandato de Compra';
      case 'valoracion': return 'Valoración';
      default: return '';
    }
  };

  const getIcon = (type: ClosureType) => {
    switch (type) {
      case 'mandato_venta': return <Target className="h-4 w-4" />;
      case 'mandato_compra': return <Building2 className="h-4 w-4" />;
      case 'valoracion': return <Calculator className="h-4 w-4" />;
      default: return null;
    }
  };

  const isFormValid = () => {
    return selectedType && payloadData.company_name && payloadData.contact_name && payloadData.contact_email;
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose} data-testid="lead-closure-dialog">
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Crear desde Lead: {lead.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">¿Qué quieres crear?</Label>
            <RadioGroup value={selectedType || ''} onValueChange={(value) => setSelectedType(value as ClosureType)}>
              <div className="space-y-2">
                {(['mandato_venta', 'mandato_compra', 'valoracion'] as const).map((type) => (
                  <div key={type} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={type} id={type} />
                    <div className="flex items-center gap-2 flex-1">
                      {getIcon(type)}
                      <Label htmlFor={type} className="flex-1 cursor-pointer">
                        {getTypeLabel(type)}
                        {suggest(lead) === type && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Recomendado
                          </span>
                        )}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Form Fields */}
          {selectedType && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Información del {getTypeLabel(selectedType)}
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Empresa *</Label>
                  <Input
                    id="company_name"
                    value={payloadData.company_name || ''}
                    onChange={(e) => setPayloadData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Nombre de la empresa"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contacto *</Label>
                  <Input
                    id="contact_name"
                    value={payloadData.contact_name || ''}
                    onChange={(e) => setPayloadData(prev => ({ ...prev, contact_name: e.target.value }))}
                    placeholder="Nombre del contacto"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={payloadData.contact_email || ''}
                    onChange={(e) => setPayloadData(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="email@empresa.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Teléfono</Label>
                  <Input
                    id="contact_phone"
                    value={payloadData.contact_phone || ''}
                    onChange={(e) => setPayloadData(prev => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="+34 xxx xxx xxx"
                  />
                </div>
              </div>

              {/* Type-specific fields */}
              {(selectedType === 'mandato_venta' || selectedType === 'mandato_compra') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <Input
                      id="sector"
                      value={payloadData.sector || ''}
                      onChange={(e) => setPayloadData(prev => ({ ...prev, sector: e.target.value }))}
                      placeholder="Sector de actividad"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ebitda_range">Rango EBITDA</Label>
                    <Input
                      id="ebitda_range"
                      value={payloadData.ebitda_range || ''}
                      onChange={(e) => setPayloadData(prev => ({ ...prev, ebitda_range: e.target.value }))}
                      placeholder="1-5M €"
                    />
                  </div>
                </div>
              )}

              {selectedType === 'valoracion' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valuation_purpose">Propósito</Label>
                    <Input
                      id="valuation_purpose"
                      value={payloadData.valuation_purpose || ''}
                      onChange={(e) => setPayloadData(prev => ({ ...prev, valuation_purpose: e.target.value }))}
                      placeholder="Venta, inversión, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="revenue_range">Rango Facturación</Label>
                    <Input
                      id="revenue_range"
                      value={payloadData.revenue_range || ''}
                      onChange={(e) => setPayloadData(prev => ({ ...prev, revenue_range: e.target.value }))}
                      placeholder="5-10M €"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Options */}
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <Checkbox
              id="link-to-lead"
              checked={linkToLead}
              onCheckedChange={(checked) => setLinkToLead(checked === true)}
            />
            <Label htmlFor="link-to-lead" className="text-sm">
              Vincular al lead y navegar al nuevo elemento
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!isFormValid() || isCreating}
          >
            {isCreating ? 'Creando...' : `Crear ${getTypeLabel(selectedType)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};