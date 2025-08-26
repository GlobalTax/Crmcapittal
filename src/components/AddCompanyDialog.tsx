
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Plus } from "lucide-react";

export const AddCompanyDialog = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    company_name: "",
    cif: "",
    sector: "",
    operation_type: "",
    amount: "",
    description: "",
    location: "",
    contact_email: "",
    contact_phone: "",
    revenue: "",
    ebitda: "",
    annual_growth_rate: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular envío de formulario por email
      const emailBody = `
Nueva solicitud para incluir empresa en la relación de Open Deals:

Empresa: ${formData.company_name}
CIF: ${formData.cif}
Sector: ${formData.sector}
Tipo de operación: ${formData.operation_type}
Valoración: €${formData.amount}
Ubicación: ${formData.location}
Email de contacto: ${formData.contact_email}
Teléfono de contacto: ${formData.contact_phone}
Facturación: €${formData.revenue}
EBITDA: €${formData.ebitda}
Crecimiento anual: ${formData.annual_growth_rate}%

Descripción:
${formData.description}
      `;

      // En un entorno real, aquí enviarías el email
      // Enviando solicitud

      toast({
        title: "Solicitud enviada",
        description: "Hemos recibido tu solicitud. Te contactaremos pronto para revisar los detalles.",
      });

      // Resetear formulario
      setFormData({
        company_name: "",
        cif: "",
        sector: "",
        operation_type: "",
        amount: "",
        description: "",
        location: "",
        contact_email: "",
        contact_phone: "",
        revenue: "",
        ebitda: "",
        annual_growth_rate: ""
      });

      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Agregar mi empresa</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Solicitar inclusión en Open Deals</span>
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para solicitar que tu empresa sea incluida en nuestra relación de Open Deals.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nombre de la empresa *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange("company_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cif">CIF *</Label>
              <Input
                id="cif"
                value={formData.cif}
                onChange={(e) => handleInputChange("cif", e.target.value)}
                placeholder="ej. A12345678"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector">Sector *</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => handleInputChange("sector", e.target.value)}
                placeholder="ej. Tecnología, Salud, Energía"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operation_type">Tipo de operación *</Label>
              <Select value={formData.operation_type} onValueChange={(value) => handleInputChange("operation_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merger">Fusión</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                  <SelectItem value="partial_sale">Venta Parcial</SelectItem>
                  <SelectItem value="buy_mandate">Mandato de Compra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valoración estimada (€) *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="ej. 5000000"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Facturación anual (€)</Label>
              <Input
                id="revenue"
                type="number"
                value={formData.revenue}
                onChange={(e) => handleInputChange("revenue", e.target.value)}
                placeholder="ej. 2000000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ebitda">EBITDA (€)</Label>
              <Input
                id="ebitda"
                type="number"
                value={formData.ebitda}
                onChange={(e) => handleInputChange("ebitda", e.target.value)}
                placeholder="ej. 400000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annual_growth_rate">Crecimiento anual (%)</Label>
              <Input
                id="annual_growth_rate"
                type="number"
                step="0.1"
                value={formData.annual_growth_rate}
                onChange={(e) => handleInputChange("annual_growth_rate", e.target.value)}
                placeholder="ej. 15.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="ej. Madrid, España"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email de contacto *</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange("contact_email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Teléfono de contacto</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange("contact_phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción de la empresa y operación *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe tu empresa, su modelo de negocio y el tipo de operación que buscas..."
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
