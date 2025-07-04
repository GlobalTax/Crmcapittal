
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Negocio } from "@/types/Negocio";
import { useContacts } from "@/hooks/useContacts";
import { useCompanies } from "@/hooks/useCompanies";
import { usePipelines } from "@/hooks/usePipelines";
import { useStages } from "@/hooks/useStages";

interface CreateNegocioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (negocio: Omit<Negocio, 'id' | 'created_at' | 'updated_at'>) => void;
}

const negocioTypes = [
  { value: "venta", label: "Venta de Empresa" },
  { value: "compra", label: "Compra de Empresa" },
  { value: "fusion", label: "Fusión" },
  { value: "valoracion", label: "Valoración" },
  { value: "consultoria", label: "Consultoría M&A" }
];

const priorities = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" }
];

export const CreateNegocioDialog = ({ open, onOpenChange, onSuccess }: CreateNegocioDialogProps) => {
  const { contacts } = useContacts();
  const { companies } = useCompanies();
  const { pipelines } = usePipelines();
  const { stages } = useStages();
  
  const [formData, setFormData] = useState({
    nombre_negocio: "",
    company_id: "",
    contact_id: "",
    valor_negocio: "",
    tipo_negocio: "venta",
    prioridad: "media",
    moneda: "EUR",
    stage_id: "",
    sector: "",
    ubicacion: "",
    descripcion: "",
    propietario_negocio: "",
    ebitda: "",
    ingresos: "",
    multiplicador: "",
    empleados: "",
    notas: "",
    fuente_lead: "",
    proxima_actividad: "",
    fecha_cierre: ""
  });

  // Get DEAL pipeline stages
  const dealPipeline = pipelines.find(p => p.type === 'DEAL');
  const dealStages = stages.filter(s => s.pipeline_id === dealPipeline?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const negocioData = {
      nombre_negocio: formData.nombre_negocio,
      company_id: formData.company_id || undefined,
      contact_id: formData.contact_id || undefined,
      valor_negocio: formData.valor_negocio ? parseInt(formData.valor_negocio) : undefined,
      tipo_negocio: formData.tipo_negocio,
      prioridad: formData.prioridad,
      moneda: formData.moneda,
      stage_id: formData.stage_id || undefined,
      sector: formData.sector || undefined,
      ubicacion: formData.ubicacion || undefined,
      descripcion: formData.descripcion || undefined,
      propietario_negocio: formData.propietario_negocio || undefined,
      ebitda: formData.ebitda ? parseInt(formData.ebitda) : undefined,
      ingresos: formData.ingresos ? parseInt(formData.ingresos) : undefined,
      multiplicador: formData.multiplicador ? parseFloat(formData.multiplicador) : undefined,
      empleados: formData.empleados ? parseInt(formData.empleados) : undefined,
      notas: formData.notas || undefined,
      fuente_lead: formData.fuente_lead || undefined,
      proxima_actividad: formData.proxima_actividad || undefined,
      fecha_cierre: formData.fecha_cierre || undefined,
      is_active: true
    } as Omit<Negocio, 'id' | 'created_at' | 'updated_at'>;

    onSuccess(negocioData);
    
    // Reset form
    setFormData({
      nombre_negocio: "",
      company_id: "",
      contact_id: "",
      valor_negocio: "",
      tipo_negocio: "venta",
      prioridad: "media",
      moneda: "EUR",
      stage_id: "",
      sector: "",
      ubicacion: "",
      descripcion: "",
      propietario_negocio: "",
      ebitda: "",
      ingresos: "",
      multiplicador: "",
      empleados: "",
      notas: "",
      fuente_lead: "",
      proxima_actividad: "",
      fecha_cierre: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Negocio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre_negocio">Nombre del Negocio *</Label>
              <Input
                id="nombre_negocio"
                value={formData.nombre_negocio}
                onChange={(e) => setFormData({ ...formData, nombre_negocio: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="company_id">Empresa</Label>
              <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="contact_id">Contacto</Label>
              <Select value={formData.contact_id} onValueChange={(value) => setFormData({ ...formData, contact_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar contacto" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} {contact.email && `(${contact.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="valor_negocio">Valor del Negocio (€)</Label>
              <Input
                id="valor_negocio"
                type="number"
                value={formData.valor_negocio}
                onChange={(e) => setFormData({ ...formData, valor_negocio: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="tipo_negocio">Tipo de Operación</Label>
              <Select value={formData.tipo_negocio} onValueChange={(value) => setFormData({ ...formData, tipo_negocio: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {negocioTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select value={formData.prioridad} onValueChange={(value) => setFormData({ ...formData, prioridad: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="stage_id">Etapa</Label>
              <Select value={formData.stage_id} onValueChange={(value) => setFormData({ ...formData, stage_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  {dealStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sector">Sector</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="propietario_negocio">Propietario</Label>
              <Input
                id="propietario_negocio"
                value={formData.propietario_negocio}
                onChange={(e) => setFormData({ ...formData, propietario_negocio: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="empleados">Empleados</Label>
              <Input
                id="empleados"
                type="number"
                value={formData.empleados}
                onChange={(e) => setFormData({ ...formData, empleados: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="ingresos">Ingresos (€)</Label>
              <Input
                id="ingresos"
                type="number"
                value={formData.ingresos}
                onChange={(e) => setFormData({ ...formData, ingresos: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="ebitda">EBITDA (€)</Label>
              <Input
                id="ebitda"
                type="number"
                value={formData.ebitda}
                onChange={(e) => setFormData({ ...formData, ebitda: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="fuente_lead">Fuente del Lead</Label>
              <Input
                id="fuente_lead"
                value={formData.fuente_lead}
                onChange={(e) => setFormData({ ...formData, fuente_lead: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="proxima_actividad">Próxima Actividad</Label>
              <Input
                id="proxima_actividad"
                value={formData.proxima_actividad}
                onChange={(e) => setFormData({ ...formData, proxima_actividad: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="fecha_cierre">Fecha de Cierre Estimada</Label>
              <Input
                id="fecha_cierre"
                type="date"
                value={formData.fecha_cierre}
                onChange={(e) => setFormData({ ...formData, fecha_cierre: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={2}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Negocio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
