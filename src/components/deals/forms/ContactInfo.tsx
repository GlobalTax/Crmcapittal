
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

interface ContactInfoProps {
  dealData: any;
  updateField: (field: string, value: string) => void;
}

export const ContactInfo = ({ dealData, updateField }: ContactInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
          <User className="h-4 w-4 mr-2" />
          Contacto Principal
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact_name">Nombre del Contacto</Label>
          <Input
            id="contact_name"
            placeholder="ej: Paloma"
            value={dealData.contact_name}
            onChange={(e) => updateField("contact_name", e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="contact_role">Cargo</Label>
          <Input
            id="contact_role"
            placeholder="ej: CEO, CFO, Propietario"
            value={dealData.contact_role}
            onChange={(e) => updateField("contact_role", e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="contact_email">Email</Label>
          <Input
            id="contact_email"
            type="email"
            placeholder="contacto@empresa.com"
            value={dealData.contact_email}
            onChange={(e) => updateField("contact_email", e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="contact_phone">Teléfono</Label>
          <Input
            id="contact_phone"
            placeholder="+34 600 000 000"
            value={dealData.contact_phone}
            onChange={(e) => updateField("contact_phone", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
