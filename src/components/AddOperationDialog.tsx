
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Operation } from "@/types/Operation";
import { useManagers } from "@/hooks/useManagers";

interface AddOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOperation: (operation: Omit<Operation, "id" | "created_at" | "updated_at">) => void;
}

export const AddOperationDialog = ({ open, onOpenChange, onAddOperation }: AddOperationDialogProps) => {
  const { managers } = useManagers();
  const [formData, setFormData] = useState({
    company_name: "",
    project_name: "",
    cif: "",
    sector: "",
    operation_type: "merger" as Operation["operation_type"],
    amount: "",
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
    contact_phone: "",
    annual_growth_rate: "",
    manager_id: "unassigned",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const operationData: Omit<Operation, "id" | "created_at" | "updated_at"> = {
      company_name: formData.company_name,
      project_name: formData.project_name || null,
      cif: formData.cif || null,
      sector: formData.sector,
      operation_type: formData.operation_type,
      amount: parseInt(formData.amount),
      revenue: formData.revenue ? parseInt(formData.revenue) : null,
      ebitda: formData.ebitda ? parseInt(formData.ebitda) : null,
      currency: formData.currency,
      date: formData.date,
      buyer: formData.buyer || null,
      seller: formData.seller || null,
      status: formData.status,
      description: formData.description || null,
      location: formData.location || null,
      contact_email: formData.contact_email || null,
      contact_phone: formData.contact_phone || null,
      annual_growth_rate: formData.annual_growth_rate ? parseFloat(formData.annual_growth_rate) : null,
      manager_id: formData.manager_id === "unassigned" ? null : formData.manager_id,
      teaser_url: null,
      created_by: null
    };

    onAddOperation(operationData);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      company_name: "",
      project_name: "",
      cif: "",
      sector: "",
      operation_type: "merger",
      amount: "",
      revenue: "",
      ebitda: "",
      currency: "EUR",
      date: "",
      buyer: "",
      seller: "",
      status: "available",
      description: "",
      location: "",
      contact_email: "",
      contact_phone: "",
      annual_growth_rate: "",
      manager_id: "unassigned",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Operación</DialogTitle>
          <DialogDescription>
            Complete los campos requeridos para crear una nueva operación en el sistema. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="project_name">Nombre del Proyecto</Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
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
            
            <div className="space-y-2">
              <Label htmlFor="sector">Sector *</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="operation_type">Tipo de Operación *</Label>
              <Select 
                value={formData.operation_type} 
                onValueChange={(value) => setFormData({ ...formData, operation_type: value as Operation["operation_type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merger">Fusión</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                  <SelectItem value="partial_sale">Venta Parcial</SelectItem>
                  <SelectItem value="buy_mandate">Mandato de Compra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Importe *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="revenue">Facturación</Label>
              <Input
                id="revenue"
                type="number"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ebitda">EBITDA</Label>
              <Input
                id="ebitda"
                type="number"
                value={formData.ebitda}
                onChange={(e) => setFormData({ ...formData, ebitda: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda *</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="buyer">Comprador</Label>
              <Input
                id="buyer"
                value={formData.buyer}
                onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seller">Vendedor</Label>
              <Input
                id="seller"
                value={formData.seller}
                onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as Operation["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="pending_review">Pendiente de revisión</SelectItem>
                  <SelectItem value="approved">Aprobada</SelectItem>
                  <SelectItem value="rejected">Rechazada</SelectItem>
                  <SelectItem value="in_process">En proceso</SelectItem>
                  <SelectItem value="sold">Vendida</SelectItem>
                  <SelectItem value="withdrawn">Retirada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manager_id">Gestor Asignado</Label>
              <Select 
                value={formData.manager_id || "unassigned"} 
                onValueChange={(value) => setFormData({ ...formData, manager_id: value === "unassigned" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar gestor..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} - {manager.position || 'Sin posición'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            
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
            
            <div className="space-y-2">
              <Label htmlFor="annual_growth_rate">Crecimiento Anual (%)</Label>
              <Input
                id="annual_growth_rate"
                type="number"
                step="0.1"
                value={formData.annual_growth_rate}
                onChange={(e) => setFormData({ ...formData, annual_growth_rate: e.target.value })}
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
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Añadir Operación
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
