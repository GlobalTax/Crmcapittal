
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface ProfessionalInfoProps {
  contactData: any;
  updateField: (field: string, value: string) => void;
}

export const ProfessionalInfo = ({ contactData, updateField }: ProfessionalInfoProps) => {
  const companySizes = [
    { value: "1-10", label: "1-10 empleados" },
    { value: "11-50", label: "11-50 empleados" },
    { value: "51-200", label: "51-200 empleados" },
    { value: "201-500", label: "201-500 empleados" },
    { value: "500+", label: "500+ empleados" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
          <Building2 className="h-4 w-4 mr-2" />
          Información Profesional
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position" className="text-gray-700">Cargo</Label>
          <Input
            id="position"
            placeholder="ej: CEO, CFO, Director"
            value={contactData.position || ''}
            onChange={(e) => updateField("position", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company" className="text-gray-700">Empresa</Label>
          <Input
            id="company"
            placeholder="Nombre de la empresa"
            value={contactData.company || ''}
            onChange={(e) => updateField("company", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company_size" className="text-gray-700">Tamaño de Empresa</Label>
          <Select value={contactData.company_size || ''} onValueChange={(value) => updateField("company_size", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tamaño" />
            </SelectTrigger>
            <SelectContent>
              {companySizes.map(size => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
