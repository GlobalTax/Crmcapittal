
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdditionalInfoProps {
  dealData: any;
  updateField: (field: string, value: string) => void;
}

export const AdditionalInfo = ({ dealData, updateField }: AdditionalInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700">
          Información Adicional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sector">Sector</Label>
            <Input
              id="sector"
              placeholder="ej: Tecnología, Servicios, Industrial"
              value={dealData.sector}
              onChange={(e) => updateField("sector", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              placeholder="ej: Barcelona, Madrid"
              value={dealData.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Descripción del Deal</Label>
          <Textarea
            id="description"
            placeholder="Describe la empresa, su modelo de negocio, situación actual..."
            value={dealData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="notes">Notas Internas</Label>
          <Textarea
            id="notes"
            placeholder="Notas privadas sobre el deal, próximos pasos, etc."
            value={dealData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};
