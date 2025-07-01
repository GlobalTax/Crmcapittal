
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Operation } from "@/types/Operation";

interface BasicOperationFieldsProps {
  formData: {
    company_name: string;
    project_name: string;
    sector: string;
    operation_type: Operation["operation_type"];
  };
  onChange: (field: string, value: string) => void;
}

export const BasicOperationFields = ({ formData, onChange }: BasicOperationFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="company_name">Nombre de la Empresa *</Label>
        <Input
          id="company_name"
          value={formData.company_name}
          onChange={(e) => onChange('company_name', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="project_name">Nombre del Proyecto</Label>
        <Input
          id="project_name"
          value={formData.project_name}
          onChange={(e) => onChange('project_name', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sector">Sector *</Label>
        <Input
          id="sector"
          value={formData.sector}
          onChange={(e) => onChange('sector', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="operation_type">Tipo de Operación *</Label>
        <Select 
          value={formData.operation_type} 
          onValueChange={(value) => onChange('operation_type', value)}
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
    </div>
  );
};
