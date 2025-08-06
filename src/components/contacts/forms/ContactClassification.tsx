
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { ContactType, ContactPriority, ContactSource } from "@/types/Contact";

interface ContactClassificationProps {
  contactData: any;
  updateField: (field: string, value: string) => void;
}

export const ContactClassification = ({ contactData, updateField }: ContactClassificationProps) => {
  const contactTypes = [
    { value: "marketing", label: "Contacto de Marketing" },
    { value: "sales", label: "Contacto de Ventas" },
    { value: "franquicia", label: "Franquiciado" },
    { value: "cliente", label: "Cliente" },
    { value: "prospect", label: "Prospect" },
    { value: "other", label: "Otro" }
  ];

  const contactPriorities = [
    { value: "low", label: "Baja", color: "bg-gray-100 text-gray-800" },
    { value: "medium", label: "Media", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "Alta", color: "bg-red-100 text-red-800" }
  ];

  const contactSources = [
    { value: "web", label: "Formulario Web" },
    { value: "referido", label: "Referido" },
    { value: "cold_outreach", label: "Prospección Fría" },
    { value: "networking", label: "Networking" },
    { value: "franquicia", label: "Red de Franquicias" },
    { value: "marketing", label: "Campaña Marketing" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Clasificación
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_type" className="text-gray-700">Tipo de Contacto</Label>
          <Select value={contactData.contact_type || 'other'} onValueChange={(value) => updateField("contact_type", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {contactTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_priority" className="text-gray-700">Prioridad</Label>
          <Select value={contactData.contact_priority || 'medium'} onValueChange={(value) => updateField("contact_priority", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {contactPriorities.map(priority => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_source" className="text-gray-700">Origen del Contacto</Label>
          <Select value={contactData.contact_source || 'web'} onValueChange={(value) => updateField("contact_source", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {contactSources.map(source => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
