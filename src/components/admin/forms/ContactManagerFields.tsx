
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Manager } from "@/types/Manager";

interface ContactManagerFieldsProps {
  formData: {
    contact_email: string;
    contact_phone: string;
    manager_id: string;
  };
  managers: Manager[];
  onChange: (field: string, value: string) => void;
}

export const ContactManagerFields = ({ formData, managers, onChange }: ContactManagerFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="contact_email">Email de Contacto</Label>
        <Input
          id="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={(e) => onChange('contact_email', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
        <Input
          id="contact_phone"
          value={formData.contact_phone}
          onChange={(e) => onChange('contact_phone', e.target.value)}
        />
      </div>
      
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="manager_id">Gestor Asignado</Label>
        <Select 
          value={formData.manager_id} 
          onValueChange={(value) => onChange('manager_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar gestor..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin asignar</SelectItem>
            {managers.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                {manager.name} - {manager.position || 'Sin posición'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
