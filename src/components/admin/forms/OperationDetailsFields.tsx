
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Operation } from "@/types/Operation";

interface OperationDetailsFieldsProps {
  formData: {
    cif: string;
    date: string;
    buyer: string;
    seller: string;
    status: Operation["status"];
    location: string;
  };
  onChange: (field: string, value: string) => void;
}

export const OperationDetailsFields = ({ formData, onChange }: OperationDetailsFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="cif">CIF</Label>
        <Input
          id="cif"
          value={formData.cif}
          onChange={(e) => onChange('cif', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">Fecha *</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => onChange('date', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="buyer">Comprador</Label>
        <Input
          id="buyer"
          value={formData.buyer}
          onChange={(e) => onChange('buyer', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="seller">Vendedor</Label>
        <Input
          id="seller"
          value={formData.seller}
          onChange={(e) => onChange('seller', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Estado *</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => onChange('status', value)}
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
        <Label htmlFor="location">Ubicación</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => onChange('location', e.target.value)}
        />
      </div>
    </div>
  );
};
