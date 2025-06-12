
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Operation } from "@/types/Operation";

interface AddOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOperation: (operation: Omit<Operation, "id" | "created_at" | "updated_at">) => void;
}

export const AddOperationDialog = ({ open, onOpenChange, onAddOperation }: AddOperationDialogProps) => {
  const [formData, setFormData] = useState({
    company_name: "",
    sector: "",
    operation_type: "" as Operation["operation_type"],
    amount: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_name || !formData.sector || !formData.operation_type || !formData.amount || !formData.date) {
      return;
    }

    onAddOperation({
      ...formData,
      amount: parseFloat(formData.amount)
    });

    // Reset form
    setFormData({
      company_name: "",
      sector: "",
      operation_type: "" as Operation["operation_type"],
      amount: "",
      currency: "EUR",
      date: "",
      buyer: "",
      seller: "",
      status: "available",
      description: "",
      location: "",
      contact_email: "",
      contact_phone: ""
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Añadir Nueva Operación</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nombre de la Empresa *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Ej: TechCorp Solutions"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Sector *</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                placeholder="Ej: Tecnología, Salud, Energía"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem value="acquisition">Adquisición</SelectItem>
                  <SelectItem value="merger">Fusión</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                  <SelectItem value="ipo">OPV</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="in_process">En Proceso</SelectItem>
                  <SelectItem value="sold">Vendida</SelectItem>
                  <SelectItem value="withdrawn">Retirada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="50000000"
                required
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyer">Comprador</Label>
              <Input
                id="buyer"
                value={formData.buyer}
                onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
                placeholder="Nombre del comprador"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller">Vendedor</Label>
              <Input
                id="seller"
                value={formData.seller}
                onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                placeholder="Nombre del vendedor"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ej: Madrid, España"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Email de Contacto</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="contacto@empresa.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
            <Input
              id="contact_phone"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="+34 600 000 000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción detallada de la operación..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Añadir Operación
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
