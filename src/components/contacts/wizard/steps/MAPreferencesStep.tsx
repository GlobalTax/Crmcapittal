
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface MAPreferencesStepProps {
  formData: any;
  onInputChange: (field: string, value: string | string[] | number) => void;
  errors: Record<string, string>;
}

const SECTORS = [
  'Tecnología', 'Salud', 'Financiero', 'Inmobiliario', 'Energía',
  'Manufactura', 'Retail', 'Educación', 'Logística', 'Alimentario',
  'Turismo', 'Medios', 'Telecomunicaciones', 'Servicios', 'Otros'
];

export const MAPreferencesStep = ({ formData, onInputChange, errors }: MAPreferencesStepProps) => {
  const handleSectorChange = (sector: string, checked: boolean) => {
    const currentSectors = formData.sectors_of_interest || [];
    if (checked) {
      onInputChange('sectors_of_interest', [...currentSectors, sector]);
    } else {
      onInputChange('sectors_of_interest', currentSectors.filter((s: string) => s !== sector));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Preferencias M&A
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Información específica sobre preferencias y capacidades en operaciones M&A.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="investment_capacity_min">Capacidad de Inversión Mínima (€)</Label>
          <Input
            id="investment_capacity_min"
            type="number"
            value={formData.investment_capacity_min || ''}
            onChange={(e) => onInputChange('investment_capacity_min', parseInt(e.target.value) || 0)}
            placeholder="100000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="investment_capacity_max">Capacidad de Inversión Máxima (€)</Label>
          <Input
            id="investment_capacity_max"
            type="number"
            value={formData.investment_capacity_max || ''}
            onChange={(e) => onInputChange('investment_capacity_max', parseInt(e.target.value) || 0)}
            placeholder="10000000"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Sectores de Interés</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SECTORS.map((sector) => (
            <div key={sector} className="flex items-center space-x-2">
              <Checkbox
                id={`sector-${sector}`}
                checked={(formData.sectors_of_interest || []).includes(sector)}
                onCheckedChange={(checked) => handleSectorChange(sector, checked as boolean)}
              />
              <Label htmlFor={`sector-${sector}`} className="text-sm">
                {sector}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deal_preferences">Preferencias de Deal (JSON)</Label>
        <Textarea
          id="deal_preferences"
          value={formData.deal_preferences || ''}
          onChange={(e) => onInputChange('deal_preferences', e.target.value)}
          placeholder='{"deal_size_preference": "mid_market", "geographic_focus": ["Spain", "Portugal"], "investment_timeline": "6-12 months"}'
          rows={4}
        />
        <p className="text-xs text-gray-500">
          Formato JSON para preferencias específicas del deal (opcional)
        </p>
      </div>
    </div>
  );
};
