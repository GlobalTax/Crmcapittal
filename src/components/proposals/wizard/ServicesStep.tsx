
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Edit, Copy, FileText, Clock, DollarSign, Calculator } from 'lucide-react';
import { CreateProposalData, ProposalService } from '@/types/Proposal';

interface ServicesStepProps {
  data: CreateProposalData;
  onChange: (data: Partial<CreateProposalData>) => void;
  errors: string[];
}

const SERVICE_TEMPLATES = [
  {
    name: 'Consultoría Legal General',
    description: 'Asesoramiento legal integral para empresas',
    billing_type: 'hourly' as const,
    hourly_rate: 150,
    estimated_hours: 10
  },
  {
    name: 'Redacción de Contratos',
    description: 'Elaboración y revisión de contratos comerciales',
    billing_type: 'fixed' as const,
    unit_price: 800
  },
  {
    name: 'Due Diligence Legal',
    description: 'Auditoría legal completa para transacciones',
    billing_type: 'fixed' as const,
    unit_price: 3500
  },
  {
    name: 'Representación Legal en Litigios',
    description: 'Representación en procesos judiciales',
    billing_type: 'contingent' as const,
    contingent_percentage: 25
  }
];

export const ServicesStep: React.FC<ServicesStepProps> = ({ data, onChange, errors }) => {
  const [editingService, setEditingService] = useState<number | null>(null);
  const [newService, setNewService] = useState<Partial<ProposalService>>({
    name: '',
    description: '',
    quantity: 1,
    billing_type: 'fixed',
    unit_price: 0
  });
  const [showTemplates, setShowTemplates] = useState(false);

  const services = data.services || [];

  const calculateServiceTotal = (service: Partial<ProposalService>): number => {
    switch (service.billing_type) {
      case 'hourly':
        return (service.quantity || 1) * (service.hourly_rate || 0) * (service.estimated_hours || 0);
      case 'fixed':
        return (service.quantity || 1) * (service.unit_price || 0);
      case 'contingent':
        return 0; // Se calcula después del éxito
      default:
        return service.unit_price || 0;
    }
  };

  const addService = (serviceData?: Partial<ProposalService>) => {
    const service: Omit<ProposalService, 'id'> = {
      name: serviceData?.name || newService.name || '',
      description: serviceData?.description || newService.description || '',
      quantity: serviceData?.quantity || newService.quantity || 1,
      unit_price: serviceData?.unit_price || newService.unit_price || 0,
      total_price: 0,
      billing_type: serviceData?.billing_type || newService.billing_type || 'fixed',
      estimated_hours: serviceData?.estimated_hours || newService.estimated_hours,
      hourly_rate: serviceData?.hourly_rate || newService.hourly_rate,
      contingent_percentage: serviceData?.contingent_percentage || newService.contingent_percentage
    };

    service.total_price = calculateServiceTotal(service);
    
    const updatedServices = [...services, service];
    onChange({ 
      services: updatedServices,
      total_amount: updatedServices.reduce((sum, s) => sum + s.total_price, 0)
    });

    // Reset form
    setNewService({
      name: '',
      description: '',
      quantity: 1,
      billing_type: 'fixed',
      unit_price: 0
    });
    setShowTemplates(false);
  };

  const updateService = (index: number, updates: Partial<ProposalService>) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], ...updates };
    updatedServices[index].total_price = calculateServiceTotal(updatedServices[index]);
    
    onChange({ 
      services: updatedServices,
      total_amount: updatedServices.reduce((sum, s) => sum + s.total_price, 0)
    });
  };

  const removeService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    onChange({ 
      services: updatedServices,
      total_amount: updatedServices.reduce((sum, s) => sum + s.total_price, 0)
    });
  };

  const duplicateService = (index: number) => {
    const original = services[index];
    const duplicate = {
      ...original,
      name: `${original.name} (Copia)`
    };
    
    const updatedServices = [...services, duplicate];
    onChange({ 
      services: updatedServices,
      total_amount: updatedServices.reduce((sum, s) => sum + s.total_price, 0)
    });
  };

  const totalAmount = services.reduce((sum, service) => sum + service.total_price, 0);

  return (
    <div className="space-y-6">
      {/* Resumen y Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Servicios</p>
                <p className="text-2xl font-bold text-blue-600">{services.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Horas Estimadas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {services.reduce((sum, s) => sum + (s.estimated_hours || 0), 0)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  €{totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Servicios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Catálogo de Servicios</CardTitle>
              <CardDescription>
                Define los servicios y productos que incluirá esta propuesta
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Plantillas</span>
              </Button>
              <Button
                onClick={() => addService()}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo Servicio</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plantillas de Servicios */}
          {showTemplates && (
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h4 className="font-medium mb-3">Plantillas de Servicios</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SERVICE_TEMPLATES.map((template, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white border rounded-lg cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => addService(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{template.name}</h5>
                        <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {template.billing_type}
                          </Badge>
                          {template.hourly_rate && (
                            <span className="text-xs text-green-600">
                              €{template.hourly_rate}/h
                            </span>
                          )}
                          {template.unit_price && (
                            <span className="text-xs text-green-600">
                              €{template.unit_price}
                            </span>
                          )}
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Servicios Existentes */}
          {services.length > 0 ? (
            <div className="space-y-3">
              {services.map((service, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    {editingService === index ? (
                      /* Modo Edición */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nombre del Servicio</Label>
                            <Input
                              value={service.name}
                              onChange={(e) => updateService(index, { name: e.target.value })}
                              placeholder="Nombre del servicio"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tipo de Facturación</Label>
                            <Select
                              value={service.billing_type}
                              onValueChange={(value) => updateService(index, { 
                                billing_type: value as any,
                                // Reset precios al cambiar tipo
                                unit_price: 0,
                                hourly_rate: 0,
                                contingent_percentage: 0
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">Precio Fijo</SelectItem>
                                <SelectItem value="hourly">Por Horas</SelectItem>
                                <SelectItem value="contingent">Contingente</SelectItem>
                                <SelectItem value="retainer">Retainer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Descripción</Label>
                          <Textarea
                            value={service.description}
                            onChange={(e) => updateService(index, { description: e.target.value })}
                            placeholder="Describe el alcance y detalles del servicio"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Cantidad</Label>
                            <Input
                              type="number"
                              min="1"
                              value={service.quantity}
                              onChange={(e) => updateService(index, { quantity: parseInt(e.target.value) || 1 })}
                            />
                          </div>

                          {service.billing_type === 'fixed' && (
                            <div className="space-y-2">
                              <Label>Precio Unitario (€)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={service.unit_price}
                                onChange={(e) => updateService(index, { unit_price: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                          )}

                          {service.billing_type === 'hourly' && (
                            <>
                              <div className="space-y-2">
                                <Label>Tarifa/Hora (€)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={service.hourly_rate || 0}
                                  onChange={(e) => updateService(index, { hourly_rate: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Horas Estimadas</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={service.estimated_hours || 0}
                                  onChange={(e) => updateService(index, { estimated_hours: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                            </>
                          )}

                          {service.billing_type === 'contingent' && (
                            <div className="space-y-2">
                              <Label>Porcentaje (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={service.contingent_percentage || 0}
                                onChange={(e) => updateService(index, { contingent_percentage: parseFloat(e.target.value) || 0 })}
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="flex items-center space-x-2">
                            <Calculator className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">
                              Total: €{calculateServiceTotal(service).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingService(null)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                updateService(index, {});
                                setEditingService(null);
                              }}
                            >
                              Guardar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Modo Vista */
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{service.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {service.billing_type}
                              </Badge>
                              {service.quantity > 1 && (
                                <Badge variant="secondary" className="text-xs">
                                  x{service.quantity}
                                </Badge>
                              )}
                            </div>
                            
                            {service.description && (
                              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              {service.billing_type === 'hourly' && (
                                <>
                                  <span>€{service.hourly_rate}/hora</span>
                                  <span>{service.estimated_hours}h estimadas</span>
                                </>
                              )}
                              {service.billing_type === 'fixed' && (
                                <span>€{service.unit_price} por unidad</span>
                              )}
                              {service.billing_type === 'contingent' && (
                                <span>{service.contingent_percentage}% contingente</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                €{service.total_price.toLocaleString()}
                              </p>
                              {service.billing_type === 'contingent' && (
                                <p className="text-xs text-gray-500">Solo si hay éxito</p>
                              )}
                            </div>
                            
                            <div className="flex flex-col space-y-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingService(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => duplicateService(index)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeService(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No hay servicios agregados</h3>
              <p className="text-sm mb-4">
                Agrega servicios para comenzar a construir tu propuesta
              </p>
              <Button
                onClick={() => setShowTemplates(true)}
                variant="outline"
                className="mr-2"
              >
                Ver Plantillas
              </Button>
              <Button onClick={() => addService()}>
                Agregar Servicio Manual
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen Final */}
      {services.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-900">Resumen de Servicios</h3>
                <p className="text-sm text-green-700">
                  {services.length} servicio{services.length !== 1 ? 's' : ''} • 
                  {services.reduce((sum, s) => sum + (s.estimated_hours || 0), 0)} horas estimadas
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-900">
                  €{totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-green-700">Total de la propuesta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
