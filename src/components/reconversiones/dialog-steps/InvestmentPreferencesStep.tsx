import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Euro, MapPin, Building, X, Plus, AlertCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { ReconversionFormData } from '@/types/Reconversion';

interface InvestmentPreferencesStepProps {
  form: UseFormReturn<ReconversionFormData>;
}

const SECTOR_SUGGESTIONS = [
  'Tecnología', 'Industrial', 'Retail', 'Alimentación', 'Salud', 'Educación',
  'Inmobiliario', 'Energía', 'Logística', 'Manufactura', 'Servicios', 'Telecomunicaciones'
];

const LOCATION_SUGGESTIONS = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Zaragoza',
  'Cataluña', 'Andalucía', 'País Vasco', 'Nacional', 'Internacional'
];

const BUSINESS_MODEL_SUGGESTIONS = [
  'B2B', 'B2C', 'Marketplace', 'SaaS', 'E-commerce', 'Franquicia',
  'Distribución', 'Manufactura', 'Servicios profesionales'
];

export function InvestmentPreferencesStep({ form }: InvestmentPreferencesStepProps) {
  const { register, setValue, watch, formState: { errors } } = form;
  
  const [newSector, setNewSector] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newBusinessModel, setNewBusinessModel] = useState('');

  const targetSectors = watch('target_sectors') || [];
  const geographicPreferences = watch('geographic_preferences') || [];
  const businessModelPreferences = watch('business_model_preferences') || [];

  const addSector = (sector: string) => {
    if (sector && !targetSectors.includes(sector)) {
      setValue('target_sectors', [...targetSectors, sector]);
    }
    setNewSector('');
  };

  const removeSector = (sector: string) => {
    setValue('target_sectors', targetSectors.filter(s => s !== sector));
  };

  const addLocation = (location: string) => {
    if (location && !geographicPreferences.includes(location)) {
      setValue('geographic_preferences', [...geographicPreferences, location]);
    }
    setNewLocation('');
  };

  const removeLocation = (location: string) => {
    setValue('geographic_preferences', geographicPreferences.filter(l => l !== location));
  };

  const addBusinessModel = (model: string) => {
    if (model && !businessModelPreferences.includes(model)) {
      setValue('business_model_preferences', [...businessModelPreferences, model]);
    }
    setNewBusinessModel('');
  };

  const removeBusinessModel = (model: string) => {
    setValue('business_model_preferences', businessModelPreferences.filter(m => m !== model));
  };

  return (
    <div className="space-y-6">
      {/* Investment Capacity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Capacidad de Inversión
          </CardTitle>
          <CardDescription>
            Especifica el rango de inversión que busca el comprador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investment_capacity_min">
                Inversión Mínima (€)
              </Label>
              <Input
                id="investment_capacity_min"
                type="number"
                {...register('investment_capacity_min', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Debe ser mayor a 0' }
                })}
                placeholder="100,000"
              />
              {errors.investment_capacity_min && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.investment_capacity_min.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="investment_capacity_max">
                Inversión Máxima (€)
              </Label>
              <Input
                id="investment_capacity_max"
                type="number"
                {...register('investment_capacity_max', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Debe ser mayor a 0' }
                })}
                placeholder="1,000,000"
              />
              {errors.investment_capacity_max && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.investment_capacity_max.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Sectors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Sectores Objetivo *
          </CardTitle>
          <CardDescription>
            Selecciona los sectores de interés para la reconversión
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Sectors */}
          {targetSectors.length > 0 && (
            <div className="space-y-2">
              <Label>Sectores seleccionados</Label>
              <div className="flex flex-wrap gap-2">
                {targetSectors.map((sector, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {sector}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => removeSector(sector)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Sector */}
          <div className="space-y-2">
            <Label htmlFor="new-sector">Añadir sector personalizado</Label>
            <div className="flex gap-2">
              <Input
                id="new-sector"
                value={newSector}
                onChange={(e) => setNewSector(e.target.value)}
                placeholder="Ej: Fintech"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSector(newSector))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addSector(newSector)}
                disabled={!newSector}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sector Suggestions */}
          <div className="space-y-2">
            <Label>Sectores sugeridos</Label>
            <div className="flex flex-wrap gap-2">
              {SECTOR_SUGGESTIONS
                .filter(sector => !targetSectors.includes(sector))
                .map((sector) => (
                <Button
                  key={sector}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSector(sector)}
                >
                  {sector}
                </Button>
              ))}
            </div>
          </div>

          {errors.target_sectors && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Debe seleccionar al menos un sector
            </p>
          )}
        </CardContent>
      </Card>

      {/* Geographic Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Preferencias Geográficas
          </CardTitle>
          <CardDescription>
            Zonas geográficas de interés (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Locations */}
          {geographicPreferences.length > 0 && (
            <div className="space-y-2">
              <Label>Ubicaciones seleccionadas</Label>
              <div className="flex flex-wrap gap-2">
                {geographicPreferences.map((location, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {location}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => removeLocation(location)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Location */}
          <div className="space-y-2">
            <Label htmlFor="new-location">Añadir ubicación personalizada</Label>
            <div className="flex gap-2">
              <Input
                id="new-location"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Ej: Asturias"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation(newLocation))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addLocation(newLocation)}
                disabled={!newLocation}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Location Suggestions */}
          <div className="space-y-2">
            <Label>Ubicaciones sugeridas</Label>
            <div className="flex flex-wrap gap-2">
              {LOCATION_SUGGESTIONS
                .filter(location => !geographicPreferences.includes(location))
                .map((location) => (
                <Button
                  key={location}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addLocation(location)}
                >
                  {location}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Model Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Modelos de Negocio
          </CardTitle>
          <CardDescription>
            Tipos de modelo de negocio preferidos (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Business Models */}
          {businessModelPreferences.length > 0 && (
            <div className="space-y-2">
              <Label>Modelos seleccionados</Label>
              <div className="flex flex-wrap gap-2">
                {businessModelPreferences.map((model, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {model}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => removeBusinessModel(model)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Business Model */}
          <div className="space-y-2">
            <Label htmlFor="new-business-model">Añadir modelo personalizado</Label>
            <div className="flex gap-2">
              <Input
                id="new-business-model"
                value={newBusinessModel}
                onChange={(e) => setNewBusinessModel(e.target.value)}
                placeholder="Ej: Suscripción"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBusinessModel(newBusinessModel))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addBusinessModel(newBusinessModel)}
                disabled={!newBusinessModel}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Business Model Suggestions */}
          <div className="space-y-2">
            <Label>Modelos sugeridos</Label>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_MODEL_SUGGESTIONS
                .filter(model => !businessModelPreferences.includes(model))
                .map((model) => (
                <Button
                  key={model}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBusinessModel(model)}
                >
                  {model}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notas Adicionales</CardTitle>
          <CardDescription>
            Información adicional sobre las preferencias de inversión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Comentarios</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Ej: Buscan empresas con potencial de expansión internacional, preferiblemente con tecnología propia..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}