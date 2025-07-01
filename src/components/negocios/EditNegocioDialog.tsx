
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Negocio } from "@/types/Negocio";

interface EditNegocioDialogProps {
  negocio: Negocio;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updates: Partial<Negocio>) => void;
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

export const EditNegocioDialog = ({ negocio, open, onOpenChange, onSuccess }: EditNegocioDialogProps) => {
  const [formData, setFormData] = useState({
    nombre_negocio: "",
    valor_negocio: "",
    tipo_negocio: "venta",
    prioridad: "media",
    moneda: "EUR",
    sector: "",
    ubicacion: "",
    descripcion: "",
    propietario_negocio: "",
    ebitda: "",
    ingresos: "",
    multiplicador: "",
    empleados: "",
    notas: ""
  });

  useEffect(() => {
    if (negocio) {
      setFormData({
        nombre_negocio: negocio.nombre_negocio || "",
        valor_negocio: negocio.valor_negocio?.toString() || "",
        tipo_negocio: negocio.tipo_negocio || "venta",
        prioridad: negocio.prioridad || "media",
        moneda: negocio.moneda || "EUR",
        sector: negocio.sector || "",
        ubicacion: negocio.ubicacion || "",
        descripcion: negocio.descripcion || "",
        propietario_negocio: negocio.propietario_negocio || "",
        ebitda: negocio.ebitda?.toString() || "",
        ingresos: negocio.ingresos?.toString() || "",
        multiplicador: negocio.multiplicador?.toString() || "",
        empleados: negocio.empleados?.toString() || "",
        notas: negocio.notas || ""
      });
    }
  }, [negocio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      nombre_negocio: formData.nombre_negocio,
      valor_negocio: formData.valor_negocio ? parseInt(formData.valor_negocio) : undefined,
      tipo_negocio: formData.tipo_negocio,
      prioridad: formData.prioridad,
      moneda: formData.moneda,
      sector: formData.sector || undefined,
      ubicacion: formData.ubicacion || undefined,
      descripcion: formData.descripcion || undefined,
      propietario_negocio: formData.propietario_negocio || undefined,
      ebitda: formData.ebitda ? parseInt(formData.ebitda) : undefined,
      ingresos: formData.ingresos ? parseInt(formData.ingresos) : undefined,
      multiplicador: formData.multiplicador ? parseFloat(formData.multiplicador) : undefined,
      empleados: formData.empleados ? parseInt(formData.empleados) : undefined,
      notas: formData.notas || undefined
    };

    onSuccess(updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Negocio</DialogTitle>
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
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
