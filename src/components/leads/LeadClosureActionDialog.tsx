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
import { useLeadClosure } from '@/hooks/leads/useLeadClosure';
import { useLeadClosureWorkflow } from '@/hooks/useLeadClosureWorkflow';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { supabase } from '@/integrations/supabase/client';

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
  const { suggest, buildPayload } = useLeadClosureWorkflow();
  const { createFromLead } = useLeadClosure();
  const { isEnabled } = useFeatureFlags();

  // Check if feature is enabled
  if (!isEnabled('lead_closure_dialog')) {
    return null;
  }

  // Map old dialog types to new workflow types
  const mapToWorkflowType = (dialogType: ClosureType) => {
    switch (dialogType) {
      case 'mandato_venta': return 'sell';
      case 'mandato_compra': return 'buy';
      case 'valoracion': return 'valuation';
      default: return null;
    }
  };

  const mapFromWorkflowType = (workflowType: string): ClosureType => {
    switch (workflowType) {
      case 'sell': return 'mandato_venta';
      case 'buy': return 'mandato_compra';
      case 'valuation': return 'valoracion';
      default: return null;
    }
  };

  // Initialize recommended type on open
  useEffect(() => {
    if (isOpen && lead) {
      const workflowRecommended = suggest(lead);
      const recommended = mapFromWorkflowType(workflowRecommended);
      setSelectedType(recommended);
      
      // Pre-fill common data
      setPayloadData({
        company_name: lead.company || '',
        contact_name: lead.name || '',
        contact_email: lead.email || '',
        contact_phone: lead.phone || ''
      });

      // Track dialog opened with analytics
      logAnalytics('lead_closure_dialog', 'dialog_opened', {
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
      const workflowType = mapToWorkflowType(selectedType);
      if (!workflowType) throw new Error('Tipo no válido');
      
      const payload = buildPayload(lead, workflowType);
      
      // Track creation attempt
      logAnalytics('lead_closure_dialog', 'creation_attempted', {
        lead_id: lead.id,
        type: selectedType,
        link_to_lead: linkToLead,
        timestamp: Date.now()
      });

      const result = await createFromLead(lead.id, workflowType, payload, linkToLead);
      
      if (result.success) {
        // Track success
        logAnalytics('lead_closure_dialog', 'creation_completed', {
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
      logAnalytics('lead_closure_dialog', 'creation_failed', {
        lead_id: lead.id,
        type: selectedType,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el elemento",
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
                        {mapFromWorkflowType(suggest(lead)) === type && (
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

// Analytics helper
const logAnalytics = async (feature: string, action: string, metadata: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('feature_analytics').insert({
      feature_key: feature,
      action,
      metadata,
      user_id: user?.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log analytics:', error);
  }
};