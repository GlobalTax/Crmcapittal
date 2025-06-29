
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import { useStages } from "@/hooks/useStages";
import { useDeals } from "@/hooks/useDeals";
import { toast } from "sonner";
import { BasicDealInfo } from "./forms/BasicDealInfo";
import { PipelineAndStatus } from "./forms/PipelineAndStatus";
import { FinancialInfo } from "./forms/FinancialInfo";
import { ContactSelector } from "./forms/ContactSelector";
import { AdditionalInfo } from "./forms/AdditionalInfo";

// UUID del pipeline por defecto creado en la base de datos
const DEFAULT_PIPELINE_ID = '00000000-0000-0000-0000-000000000001';

interface CreateDealDialogProps {
  pipelineId?: string;
}

export const CreateDealDialog = ({ pipelineId = DEFAULT_PIPELINE_ID }: CreateDealDialogProps) => {
  const [open, setOpen] = useState(false);
  const { stages } = useStages(pipelineId);
  const { createDeal } = useDeals();
  
  const [dealData, setDealData] = useState({
    deal_name: "",
    company_name: "",
    deal_value: "",
    currency: "EUR",
    deal_type: "venta",
    stage_id: "",
    priority: "media",
    deal_owner: "",
    ebitda: "",
    revenue: "",
    multiplier: "",
    sector: "",
    location: "",
    employees: "",
    // Contacto principal (asociado)
    contact_id: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    contact_role: "",
    description: "",
    lead_source: "",
    next_activity: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dealData.contact_id) {
      toast.error('Por favor selecciona un contacto para asociar al deal');
      return;
    }
    
    const dealPayload = {
      ...dealData,
      deal_value: dealData.deal_value ? parseInt(dealData.deal_value) : undefined,
      ebitda: dealData.ebitda ? parseInt(dealData.ebitda) : undefined,
      revenue: dealData.revenue ? parseInt(dealData.revenue) : undefined,
      multiplier: dealData.multiplier ? parseFloat(dealData.multiplier) : undefined,
      employees: dealData.employees ? parseInt(dealData.employees) : undefined,
      stage_id: dealData.stage_id || (stages.length > 0 ? stages[0].id : undefined),
      is_active: true
    };
    
    const { error } = await createDeal(dealPayload);
    
    if (error) {
      toast.error(`Error al crear el deal: ${error}`);
    } else {
      toast.success('Deal creado exitosamente');
      setOpen(false);
      // Reset form
      setDealData({
        deal_name: "",
        company_name: "",
        deal_value: "",
        currency: "EUR",
        deal_type: "venta",
        stage_id: "",
        priority: "media",
        deal_owner: "",
        ebitda: "",
        revenue: "",
        multiplier: "",
        sector: "",
        location: "",
        employees: "",
        contact_id: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        contact_role: "",
        description: "",
        lead_source: "",
        next_activity: "",
        notes: ""
      });
    }
  };

  const updateField = (field: string, value: string) => {
    setDealData(prev => ({ ...prev, [field]: value }));
  };

  // Set default stage when stages are loaded
  if (stages.length > 0 && !dealData.stage_id) {
    setDealData(prev => ({ ...prev, stage_id: stages[0].id }));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-neutral-900 hover:bg-neutral-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Crear Deal M&A
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-neutral-600" />
            Crear Nuevo Deal M&A
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicDealInfo dealData={dealData} updateField={updateField} />
          <PipelineAndStatus dealData={dealData} updateField={updateField} stages={stages} />
          <FinancialInfo dealData={dealData} updateField={updateField} />
          <ContactSelector dealData={dealData} updateField={updateField} />
          <AdditionalInfo dealData={dealData} updateField={updateField} />

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              Crear Deal M&A
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
