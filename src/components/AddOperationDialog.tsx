
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Operation } from "@/pages/Index";

interface AddOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOperation: (operation: Omit<Operation, "id">) => void;
}

export const AddOperationDialog = ({ open, onOpenChange, onAddOperation }: AddOperationDialogProps) => {
  const [formData, setFormData] = useState({
    companyName: "",
    sector: "",
    operationType: "" as Operation["operationType"],
    amount: "",
    currency: "EUR",
    date: "",
    buyer: "",
    seller: "",
    status: "pending" as Operation["status"],
    description: "",
    location: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.sector || !formData.operationType || !formData.amount || !formData.date) {
      return;
    }

    onAddOperation({
      ...formData,
      amount: parseFloat(formData.amount)
    });

    // Reset form
    setFormData({
      companyName: "",
      sector: "",
      operationType: "" as Operation["operationType"],
      amount: "",
      currency: "EUR",
      date: "",
      buyer: "",
      seller: "",
      status: "pending",
      description: "",
      location: ""
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
              <Label htmlFor="companyName">Nombre de la Empresa *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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
              <Label htmlFor="operationType">Tipo de Operación *</Label>
              <Select 
                value={formData.operationType} 
                onValueChange={(value: Operation["operationType"]) => 
                  setFormData({ ...formData, operationType: value })
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
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
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
