
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinancialOperationFieldsProps {
  formData: {
    amount: string;
    revenue: string;
    ebitda: string;
    currency: string;
    annual_growth_rate: string;
  };
  onChange: (field: string, value: string) => void;
}

export const FinancialOperationFields = ({ formData, onChange }: FinancialOperationFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Importe *</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => onChange('amount', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="revenue">Facturación</Label>
        <Input
          id="revenue"
          type="number"
          value={formData.revenue}
          onChange={(e) => onChange('revenue', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="ebitda">EBITDA</Label>
        <Input
          id="ebitda"
          type="number"
          value={formData.ebitda}
          onChange={(e) => onChange('ebitda', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="currency">Moneda *</Label>
        <Select 
          value={formData.currency} 
          onValueChange={(value) => onChange('currency', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="GBP">GBP</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="annual_growth_rate">Crecimiento Anual (%)</Label>
        <Input
          id="annual_growth_rate"
          type="number"
          step="0.1"
          value={formData.annual_growth_rate}
          onChange={(e) => onChange('annual_growth_rate', e.target.value)}
        />
      </div>
    </div>
  );
};
