
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

interface PersonalInfoProps {
  contactData: any;
  updateField: (field: string, value: string) => void;
}

export const PersonalInfo = ({ contactData, updateField }: PersonalInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
          <User className="h-4 w-4 mr-2" />
          Información Personal
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-gray-700">Nombre *</Label>
          <Input
            id="first_name"
            placeholder="Nombre"
            value={contactData.first_name || ''}
            onChange={(e) => updateField("first_name", e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-gray-700">Apellidos</Label>
          <Input
            id="last_name"
            placeholder="Apellidos"
            value={contactData.last_name || ''}
            onChange={(e) => updateField("last_name", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@empresa.com"
            value={contactData.email || ''}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700">Teléfono</Label>
          <Input
            id="phone"
            placeholder="+34 600 000 000"
            value={contactData.phone || ''}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mobile" className="text-gray-700">Móvil</Label>
          <Input
            id="mobile"
            placeholder="+34 600 000 000"
            value={contactData.mobile || ''}
            onChange={(e) => updateField("mobile", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="linkedin_url" className="text-gray-700">LinkedIn</Label>
          <Input
            id="linkedin_url"
            placeholder="https://linkedin.com/in/..."
            value={contactData.linkedin_url || ''}
            onChange={(e) => updateField("linkedin_url", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
