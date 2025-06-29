
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro } from "lucide-react";

interface FinancialInfoProps {
  dealData: any;
  updateField: (field: string, value: string) => void;
}

export const FinancialInfo = ({ dealData, updateField }: FinancialInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
          <Euro className="h-4 w-4 mr-2" />
          Información Financiera
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="revenue">Facturación Anual (€)</Label>
          <Input
            id="revenue"
            type="number"
            placeholder="500000"
            value={dealData.revenue}
            onChange={(e) => updateField("revenue", e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="ebitda">EBITDA (€)</Label>
          <Input
            id="ebitda"
            type="number"
            placeholder="125000"
            value={dealData.ebitda}
            onChange={(e) => updateField("ebitda", e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="multiplier">Múltiplo</Label>
          <Input
            id="multiplier"
            type="number"
            step="0.1"
            placeholder="4.0"
            value={dealData.multiplier}
            onChange={(e) => updateField("multiplier", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
