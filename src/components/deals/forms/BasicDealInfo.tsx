
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface BasicDealInfoProps {
  dealData: any;
  updateField: (field: string, value: string) => void;
}

const dealTypes = [
  { value: "venta", label: "Venta de Empresa" },
  { value: "compra", label: "Compra de Empresa" },
  { value: "fusion", label: "Fusión" },
  { value: "valoracion", label: "Valoración" },
  { value: "consultoria", label: "Consultoría M&A" }
];

export const BasicDealInfo = ({ dealData, updateField }: BasicDealInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
          <Building2 className="h-4 w-4 mr-2" />
          Información Básica del Deal
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deal_name">Nombre del Deal *</Label>
          <Input
            id="deal_name"
            placeholder="ej: ESTRAPEY FINANZA"
            value={dealData.deal_name}
            onChange={(e) => updateField("deal_name", e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="company_name">Nombre de la Empresa</Label>
          <Input
            id="company_name"
            placeholder="Empresa objetivo"
            value={dealData.company_name}
            onChange={(e) => updateField("company_name", e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="deal_value">Valor del Deal (€)</Label>
          <Input
            id="deal_value"
            type="number"
            placeholder="70000"
            value={dealData.deal_value}
            onChange={(e) => updateField("deal_value", e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="deal_type">Tipo de Operación</Label>
          <Select value={dealData.deal_type} onValueChange={(value) => updateField("deal_type", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dealTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
