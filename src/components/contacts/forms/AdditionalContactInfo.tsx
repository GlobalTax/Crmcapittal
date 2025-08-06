
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface ContactFormData {
  city?: string;
  country?: string;
  address?: string;
  notes?: string;
}

interface AdditionalContactInfoProps {
  contactData: ContactFormData;
  updateField: (field: string, value: string) => void;
}

export const AdditionalContactInfo = ({ contactData, updateField }: AdditionalContactInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Información Adicional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-gray-700">Ciudad</Label>
            <Input
              id="city"
              placeholder="ej: Barcelona, Madrid"
              value={contactData.city || ''}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country" className="text-gray-700">País</Label>
            <Input
              id="country"
              placeholder="España"
              value={contactData.country || 'España'}
              onChange={(e) => updateField("country", e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address" className="text-gray-700">Dirección</Label>
          <Input
            id="address"
            placeholder="Dirección completa"
            value={contactData.address || ''}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-gray-700">Notas</Label>
          <Textarea
            id="notes"
            placeholder="Notas sobre el contacto, intereses, historial de conversaciones..."
            value={contactData.notes || ''}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};
