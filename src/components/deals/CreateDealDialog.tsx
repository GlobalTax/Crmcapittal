
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Euro, User, Flag } from "lucide-react";
import { useStages } from "@/hooks/useStages";
import { useDeals } from "@/hooks/useDeals";
import { toast } from "sonner";

interface CreateDealDialogProps {
  pipelineId: string;
}

export const CreateDealDialog = ({ pipelineId }: CreateDealDialogProps) => {
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
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    contact_role: "",
    description: "",
    lead_source: "",
    next_activity: "",
    notes: ""
  });

  const priorities = [
    { value: "baja", label: "Baja", color: "bg-gray-100 text-gray-800" },
    { value: "media", label: "Media", color: "bg-yellow-100 text-yellow-800" },
    { value: "alta", label: "Alta", color: "bg-orange-100 text-orange-800" },
    { value: "urgente", label: "Urgente", color: "bg-red-100 text-red-800" }
  ];

  const dealTypes = [
    { value: "venta", label: "Venta de Empresa" },
    { value: "compra", label: "Compra de Empresa" },
    { value: "fusion", label: "Fusión" },
    { value: "valoracion", label: "Valoración" },
    { value: "consultoria", label: "Consultoría M&A" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Crear Deal M&A
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-orange-600" />
            Crear Nuevo Deal M&A
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Información Básica del Deal
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deal_name">Nombre del Deal *</Label>
                <Input
                  id="deal_name"
                  placeholder="ej: ESTRAPEY FINANZA"
                  value={dealData.deal_name}
                  onChange={(e) => updateField("deal_name", e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="company_name">Nombre de la Empresa</Label>
                <Input
                  id="company_name"
                  placeholder="Empresa objetivo"
                  value={dealData.company_name}
                  onChange={(e) => updateField("company_name", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="deal_value">Valor del Deal (€)</Label>
                <Input
                  id="deal_value"
                  type="number"
                  placeholder="70000"
                  value={dealData.deal_value}
                  onChange={(e) => updateField("deal_value", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="deal_type">Tipo de Operación</Label>
                <Select value={dealData.deal_type} onValueChange={(value) => updateField("deal_type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dealTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline y Estado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                <Flag className="h-4 w-4 mr-2" />
                Pipeline y Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stage_id">Etapa del Pipeline</Label>
                <Select value={dealData.stage_id} onValueChange={(value) => updateField("stage_id", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={dealData.priority} onValueChange={(value) => updateField("priority", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <div className="flex items-center">
                          <Badge className={`mr-2 ${priority.color}`}>
                            {priority.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Información Financiera */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                <Euro className="h-4 w-4 mr-2" />
                Información Financiera
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="revenue">Facturación Anual (€)</Label>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="500000"
                  value={dealData.revenue}
                  onChange={(e) => updateField("revenue", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="ebitda">EBITDA (€)</Label>
                <Input
                  id="ebitda"
                  type="number"
                  placeholder="125000"
                  value={dealData.ebitda}
                  onChange={(e) => updateField("ebitda", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="multiplier">Múltiplo</Label>
                <Input
                  id="multiplier"
                  type="number"
                  step="0.1"
                  placeholder="4.0"
                  value={dealData.multiplier}
                  onChange={(e) => updateField("multiplier", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Contacto Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_name">Nombre del Contacto</Label>
                <Input
                  id="contact_name"
                  placeholder="ej: Paloma"
                  value={dealData.contact_name}
                  onChange={(e) => updateField("contact_name", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="contact_role">Cargo</Label>
                <Input
                  id="contact_role"
                  placeholder="ej: CEO, CFO, Propietario"
                  value={dealData.contact_role}
                  onChange={(e) => updateField("contact_role", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="contacto@empresa.com"
                  value={dealData.contact_email}
                  onChange={(e) => updateField("contact_email", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="contact_phone">Teléfono</Label>
                <Input
                  id="contact_phone"
                  placeholder="+34 600 000 000"
                  value={dealData.contact_phone}
                  onChange={(e) => updateField("contact_phone", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700">
                Información Adicional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    placeholder="ej: Tecnología, Servicios, Industrial"
                    value={dealData.sector}
                    onChange={(e) => updateField("sector", e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    placeholder="ej: Barcelona, Madrid"
                    value={dealData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descripción del Deal</Label>
                <Textarea
                  id="description"
                  placeholder="Describe la empresa, su modelo de negocio, situación actual..."
                  value={dealData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notas Internas</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas privadas sobre el deal, próximos pasos, etc."
                  value={dealData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
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
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Crear Deal M&A
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
