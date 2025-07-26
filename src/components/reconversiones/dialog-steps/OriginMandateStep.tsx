import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Plus, CheckCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { ReconversionFormData } from '@/types/Reconversion';

interface OriginMandateStepProps {
  form: UseFormReturn<ReconversionFormData>;
}

// Mock data - replace with real data from API
const mockMandates = [
  {
    id: '1',
    name: 'Mandato Tecnología Q1 2024',
    client: 'Fondo Inversión Tech',
    sectors: ['Tecnología', 'Software'],
    status: 'active'
  },
  {
    id: '2', 
    name: 'Mandato Industrial 2024',
    client: 'Grupo Industrial ABC',
    sectors: ['Industrial', 'Manufactura'],
    status: 'active'
  },
  {
    id: '3',
    name: 'Mandato Retail & Consumer',
    client: 'Family Office XYZ',
    sectors: ['Retail', 'Consumo'],
    status: 'completed'
  }
];

export function OriginMandateStep({ form }: OriginMandateStepProps) {
  const { setValue, watch } = form;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMandate, setSelectedMandate] = useState<string | null>(null);

  const selectedMandateId = watch('original_mandate_id');

  const filteredMandates = mockMandates.filter(mandate =>
    mandate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mandate.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mandate.sectors.some(sector => sector.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectMandate = (mandateId: string) => {
    setSelectedMandate(mandateId);
    setValue('original_mandate_id', mandateId);
  };

  const handleClearSelection = () => {
    setSelectedMandate(null);
    setValue('original_mandate_id', '');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Mandato de Origen (Opcional)
          </CardTitle>
          <CardDescription>
            Si esta reconversión está relacionada con un mandato específico, selecciónalo aquí. 
            Esto ayudará a hacer un seguimiento mejor del proceso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="mandate-search">Buscar mandato</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="mandate-search"
                placeholder="Buscar por nombre, cliente o sector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Selected Mandate */}
          {selectedMandateId && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Mandato seleccionado</h4>
                      {(() => {
                        const mandate = mockMandates.find(m => m.id === selectedMandateId);
                        return mandate ? (
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p><strong>{mandate.name}</strong></p>
                            <p>Cliente: {mandate.client}</p>
                            <p>Sectores: {mandate.sectors.join(', ')}</p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                  >
                    Cambiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mandate List */}
          {!selectedMandateId && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Mandatos disponibles</h4>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Crear nuevo mandato
                </Button>
              </div>

              {filteredMandates.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No se encontraron mandatos' : 'No hay mandatos disponibles'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {filteredMandates.map((mandate) => (
                    <Card 
                      key={mandate.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                      onClick={() => handleSelectMandate(mandate.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium">{mandate.name}</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              Cliente: {mandate.client}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">Sectores:</span>
                              {mandate.sectors.map((sector, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-muted px-2 py-1 rounded"
                                >
                                  {sector}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded ${
                              mandate.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {mandate.status === 'active' ? 'Activo' : 'Completado'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skip Option */}
          {!selectedMandateId && (
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                ¿No encuentras el mandato relacionado?
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {/* Skip to next step */}}
              >
                Continuar sin asociar mandato
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}