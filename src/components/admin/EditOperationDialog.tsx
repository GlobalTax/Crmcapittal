
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Operation } from "@/types/Operation";
import { useManagers } from "@/hooks/useManagers";
import { useEditOperationForm } from "@/hooks/admin/useEditOperationForm";
import { BasicOperationFields } from "./forms/BasicOperationFields";
import { FinancialOperationFields } from "./forms/FinancialOperationFields";
import { OperationDetailsFields } from "./forms/OperationDetailsFields";
import { ContactManagerFields } from "./forms/ContactManagerFields";

interface EditOperationDialogProps {
  operation: Operation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (operationData: Partial<Operation>) => Promise<void>;
}

export const EditOperationDialog = ({ 
  operation, 
  open, 
  onOpenChange, 
  onSave 
}: EditOperationDialogProps) => {
  const { managers } = useManagers();
  const { formData, updateField, getSubmitData } = useEditOperationForm(operation);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!operation) return;

    const updateData = getSubmitData();
    await onSave(updateData);
    onOpenChange(false);
  };

  if (!operation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Operación</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicOperationFields
            formData={{
              company_name: formData.company_name,
              project_name: formData.project_name,
              sector: formData.sector,
              operation_type: formData.operation_type,
            }}
            onChange={updateField}
          />
          
          <FinancialOperationFields
            formData={{
              amount: formData.amount,
              revenue: formData.revenue,
              ebitda: formData.ebitda,
              currency: formData.currency,
              annual_growth_rate: formData.annual_growth_rate,
            }}
            onChange={updateField}
          />
          
          <OperationDetailsFields
            formData={{
              cif: formData.cif,
              date: formData.date,
              buyer: formData.buyer,
              seller: formData.seller,
              status: formData.status,
              location: formData.location,
            }}
            onChange={updateField}
          />
          
          <ContactManagerFields
            formData={{
              contact_email: formData.contact_email,
              contact_phone: formData.contact_phone,
              manager_id: formData.manager_id,
            }}
            managers={managers}
            onChange={updateField}
          />
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
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
