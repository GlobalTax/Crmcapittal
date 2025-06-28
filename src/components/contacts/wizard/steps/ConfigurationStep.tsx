
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface ConfigurationStepProps {
  formData: any;
  onInputChange: (field: string, value: boolean) => void;
}

export const ConfigurationStep = ({ formData, onInputChange }: ConfigurationStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configuración Final
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Configuraciones adicionales y resumen del contacto antes de guardarlo.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active !== false}
            onCheckedChange={(checked) => onInputChange('is_active', checked as boolean)}
          />
          <Label htmlFor="is_active">Contacto activo</Label>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Resumen del Contacto</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Nombre:</span>
              <span className="font-medium">{formData.name || 'No especificado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span>{formData.email || 'No especificado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Empresa:</span>
              <span>{formData.company || 'No especificado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo:</span>
              <Badge variant="secondary">
                {formData.contact_type ? 
                  (formData.contact_type === 'buyer' ? 'Comprador' :
                   formData.contact_type === 'seller' ? 'Vendedor' :
                   formData.contact_type === 'advisor' ? 'Asesor' :
                   formData.contact_type === 'investor' ? 'Inversor' : 
                   'Otro') : 'Otro'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prioridad:</span>
              <Badge className={
                formData.contact_priority === 'urgent' ? 'bg-red-100 text-red-800' :
                formData.contact_priority === 'high' ? 'bg-orange-100 text-orange-800' :
                formData.contact_priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }>
                {formData.contact_priority === 'urgent' ? 'Urgente' :
                 formData.contact_priority === 'high' ? 'Alta' :
                 formData.contact_priority === 'medium' ? 'Media' : 'Baja'}
              </Badge>
            </div>
            {formData.investment_capacity_min && formData.investment_capacity_max && (
              <div className="flex justify-between">
                <span className="text-gray-600">Capacidad Inversión:</span>
                <span>€{formData.investment_capacity_min?.toLocaleString()} - €{formData.investment_capacity_max?.toLocaleString()}</span>
              </div>
            )}
            {formData.sectors_of_interest && formData.sectors_of_interest.length > 0 && (
              <div>
                <span className="text-gray-600">Sectores de Interés:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.sectors_of_interest.slice(0, 3).map((sector: string) => (
                    <Badge key={sector} variant="outline" className="text-xs">
                      {sector}
                    </Badge>
                  ))}
                  {formData.sectors_of_interest.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{formData.sectors_of_interest.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
