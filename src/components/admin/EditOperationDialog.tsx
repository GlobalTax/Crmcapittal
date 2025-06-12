
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Operation } from "@/types/Operation";

interface EditOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: Operation | null;
  onSave: (operationData: Partial<Operation>) => Promise<void>;
}

const SECTORS = [
  "Tecnología", "Salud", "Energía", "Finanzas", "Retail", "Inmobiliario",
  "Manufacturero", "Alimentación", "Turismo", "Logística", "Educación",
  "Telecomunicaciones", "Automoción", "Farmacéutico", "Construcción"
];

const PROVINCES = [
  "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", 
  "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real",
  "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara", "Gipuzkoa", "Huelva",
  "Huesca", "Jaén", "La Coruña", "La Rioja", "Las Palmas", "León", "Lleida",
  "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Palencia",
  "Pontevedra", "Salamanca", "Segovia", "Sevilla", "Soria", "Tarragona",
  "Santa Cruz de Tenerife", "Teruel", "Toledo", "Valencia", "Valladolid",
  "Bizkaia", "Zamora", "Zaragoza"
];

const formatNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseFormattedNumber = (value: string) => {
  return parseInt(value.replace(/\./g, '')) || 0;
};

export const EditOperationDialog = ({ 
  open, 
  onOpenChange, 
  operation,
  onSave 
}: EditOperationDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    cif: "",
    sector: "",
    operation_type: "" as Operation["operation_type"],
    revenue: "",
    ebitda: "",
    currency: "EUR",
    date: "",
    buyer: "",
    seller: "",
    status: "available" as Operation["status"],
    description: "",
    location: "",
    contact_email: "",
    contact_phone: ""
  });

  useEffect(() => {
    if (operation) {
      setFormData({
        company_name: operation.company_name || "",
        cif: operation.cif || "",
        sector: operation.sector || "",
        operation_type: operation.operation_type || "" as Operation["operation_type"],
        revenue: operation.revenue ? formatNumber(operation.revenue.toString()) : "",
        ebitda: operation.ebitda ? formatNumber(operation.ebitda.toString()) : "",
        currency: operation.currency || "EUR",
        date: operation.date || "",
        buyer: operation.buyer || "",
        seller: operation.seller || "",
        status: operation.status || "available",
        description: operation.description || "",
        location: operation.location || "",
        contact_email: operation.contact_email || "",
        contact_phone: operation.contact_phone || ""
      });
    }
  }, [operation]);

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setFormData({ ...formData, revenue: formatted });
  };

  const handleEbitdaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setFormData({ ...formData, ebitda: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_name || !formData.sector || !formData.operation_type || !formData.revenue || !formData.date) {
      return;
    }

    setIsSubmitting(true);

    try {
      const revenueValue = parseFormattedNumber(formData.revenue);
      const ebitdaValue = parseFormattedNumber(formData.ebitda);
      
      const operationData = {
        company_name: formData.company_name,
        cif: formData.cif,
        sector: formData.sector,
        operation_type: formData.operation_type,
        amount: revenueValue,
        revenue: revenueValue,
        ebitda: ebitdaValue,
        currency: formData.currency,
        date: formData.date,
        buyer: formData.buyer,
        seller: formData.seller,
        status: formData.status,
        description: formData.description,
        location: formData.location,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone
      };

      await onSave(operationData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating operation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showBuyerField = formData.operation_type === "buy_mandate";
  const showSellerField = formData.operation_type === "sale" || formData.operation_type === "partial_sale";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Editar Operación
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nombre de la Empresa *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cif">CIF</Label>
              <Input
                id="cif"
                value={formData.cif}
                onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector">Sector *</Label>
              <Select 
                value={formData.sector} 
                onValueChange={(value) => setFormData({ ...formData, sector: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operation_type">Tipo de Operación *</Label>
              <Select 
                value={formData.operation_type} 
                onValueChange={(value: Operation["operation_type"]) => 
                  setFormData({ ...formData, operation_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
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
            <Label htmlFor="status">Estado</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: Operation["status"]) => 
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="pending_review">Pendiente de Revisión</SelectItem>
                <SelectItem value="approved">Aprobada</SelectItem>
                <SelectItem value="rejected">Rechazada</SelectItem>
                <SelectItem value="in_process">En Proceso</SelectItem>
                <SelectItem value="sold">Vendida</SelectItem>
                <SelectItem value="withdrawn">Retirada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Facturación *</Label>
              <Input
                id="revenue"
                value={formData.revenue}
                onChange={handleRevenueChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ebitda">EBITDA</Label>
              <Input
                id="ebitda"
                value={formData.ebitda}
                onChange={handleEbitdaChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {(showBuyerField || showSellerField) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showBuyerField && (
                <div className="space-y-2">
                  <Label htmlFor="buyer">Comprador</Label>
                  <Input
                    id="buyer"
                    value={formData.buyer}
                    onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
                  />
                </div>
              )}

              {showSellerField && (
                <div className="space-y-2">
                  <Label htmlFor="seller">Vendedor</Label>
                  <Input
                    id="seller"
                    value={formData.seller}
                    onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Select 
              value={formData.location} 
              onValueChange={(value) => setFormData({ ...formData, location: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar provincia" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>{province}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email de Contacto</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
