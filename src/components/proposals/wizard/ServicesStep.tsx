import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { FileText, Plus, Edit, Trash2, Copy, DollarSign, Clock, Percent } from 'lucide-react';
import { CreateProposalData, ProposalService } from '@/types/Proposal';
import { useToast } from '@/hooks/use-toast';

interface ServicesStepProps {
  data: CreateProposalData;
  onChange: (data: Partial<CreateProposalData>) => void;
  errors: string[];
}

export const ServicesStep: React.FC<ServicesStepProps> = ({ data, onChange, errors }) => {
  const [services, setServices] = useState<Omit<ProposalService, 'id'>[]>(data.services || []);
  const [editingService, setEditingService] = useState<number | null>(null);
  const [newService, setNewService] = useState<Omit<ProposalService, 'id'>>({
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    billing_type: 'fixed'
  });
  const { toast } = useToast();

  useEffect(() => {
    onChange({ services: services });
    recalculateTotal();
  }, [services, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewService(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewService(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotalPrice = () => {
    const price = newService.unit_price * newService.quantity;
    setNewService(prev => ({ ...prev, total_price: price }));
  };

  const recalculateTotal = () => {
    let total = 0;
    services.forEach(service => {
      total += service.unit_price * service.quantity;
    });
    onChange({ total_amount: total });
  };

  const addService = (serviceData?: Partial<ProposalService>) => {
    const service: Omit<ProposalService, 'id'> = {
      name: serviceData?.name || newService.name || '',
      description: serviceData?.description || newService.description || '',
      quantity: serviceData?.quantity || newService.quantity || 1,
      unit_price: serviceData?.unit_price || newService.unit_price || 0,
      total_price: serviceData?.total_price || newService.total_price || 0,
      billing_type: serviceData?.billing_type || newService.billing_type || 'fixed',
      estimated_hours: serviceData?.estimated_hours || newService.estimated_hours,
      hourly_rate: serviceData?.hourly_rate || newService.hourly_rate,
      contingent_percentage: serviceData?.contingent_percentage || newService.contingent_percentage
    };

    const updatedServices = [...services, service];
    setServices(updatedServices);
    
    // Limpiar formulario
    setNewService({
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      billing_type: 'fixed'
    });
  };

  const handleAddService = () => {
    addService();
  };

  const updateService = (index: number, updates: Partial<Omit<ProposalService, 'id'>>) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], ...updates };
    setServices(updatedServices);
    setEditingService(null);
  };

  const removeService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    setServices(updatedServices);
  };

  const duplicateService = (index: number) => {
    const original = services[index];
    const duplicate = {
      ...original,
      name: `${original.name} (Copia)`
    };
    
    const updatedServices = [...services];
    updatedServices.splice(index + 1, 0, duplicate);
    setServices(updatedServices);
  };

  const getTotal = () => {
    let total = 0;
    services.forEach(service => {
      total += service.unit_price * service.quantity;
    });
    return total;
  };

  const getBillingTypeIcon = (type: string) => {
    switch (type) {
      case 'fixed': return <DollarSign className="h-4 w-4" />;
      case 'hourly': return <Clock className="h-4 w-4" />;
      case 'contingent': return <Percent className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Formulario para Agregar Servicio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Agregar Servicio o Producto</span>
          </CardTitle>
          <CardDescription>
            Define los servicios o productos que ofrecerás en la propuesta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_name">Nombre del Servicio *</Label>
              <Input
                id="service_name"
                name="name"
                value={newService.name}
                onChange={handleInputChange}
                placeholder="Ej: Consultoría Legal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_description">Descripción</Label>
              <Input
                id="service_description"
                name="description"
                value={newService.description}
                onChange={handleInputChange}
                placeholder="Descripción detallada del servicio"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_quantity">Cantidad</Label>
              <Input
                id="service_quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                value={newService.quantity}
                onChange={handleInputChange}
                onBlur={calculateTotalPrice}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_unit_price">Precio Unitario (€)</Label>
              <Input
                id="service_unit_price"
                name="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={newService.unit_price}
                onChange={handleInputChange}
                onBlur={calculateTotalPrice}
                placeholder="Ej: 150"
              />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <div className="p-2 bg-gray-50 border rounded-md">
                <p className="text-lg font-bold text-green-600">
                  €{newService.total_price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_billing_type">Tipo de Cobro</Label>
            <Select onValueChange={(value) => handleSelectChange('billing_type', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Precio Fijo</SelectItem>
                <SelectItem value="hourly">Por Hora</SelectItem>
                <SelectItem value="contingent">Contingente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAddService} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Servicio
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Servicios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Servicios Agregados</span>
            </div>
            <Badge variant="outline" className="text-sm">
              {services.length} servicio{services.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {services.length > 0 ? (
            <div className="space-y-3">
              {services.map((service, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <div className="md:col-span-2 space-y-2">
                        <h3 className="text-lg font-semibold">{service.name}</h3>
                        <p className="text-sm text-gray-500">{service.description}</p>
                        <div className="flex items-center space-x-2 text-gray-600">
                          {getBillingTypeIcon(service.billing_type)}
                          <span className="text-xs">{service.billing_type}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-xl font-bold text-green-600">
                          €{(service.unit_price * service.quantity).toLocaleString()}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingService(index)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateService(index)}
                            className="text-gray-500 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeService(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {editingService === index && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <h4 className="mb-3 font-medium">Editar Servicio</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`edit_service_name_${index}`}>Nombre</Label>
                            <Input
                              id={`edit_service_name_${index}`}
                              value={service.name}
                              onChange={(e) => updateService(index, { name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edit_service_description_${index}`}>Descripción</Label>
                            <Input
                              id={`edit_service_description_${index}`}
                              value={service.description}
                              onChange={(e) => updateService(index, { description: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`edit_service_quantity_${index}`}>Cantidad</Label>
                            <Input
                              id={`edit_service_quantity_${index}`}
                              type="number"
                              value={service.quantity}
                              onChange={(e) => updateService(index, { quantity: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edit_service_unit_price_${index}`}>Precio Unitario</Label>
                            <Input
                              id={`edit_service_unit_price_${index}`}
                              type="number"
                              value={service.unit_price}
                              onChange={(e) => updateService(index, { unit_price: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Total</Label>
                            <div className="p-2 bg-gray-100 border rounded-md">
                              <p className="font-bold">
                                €{(service.unit_price * service.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => setEditingService(null)} variant="secondary" size="sm">
                          Guardar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              <div className="p-4 bg-gray-50 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Servicios:</span>
                  <span className="text-lg font-bold text-green-600">
                    €{getTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Sin servicios agregados</h3>
              <p className="text-sm mb-4">
                Agrega servicios para detallar tu propuesta
              </p>
              <Button onClick={handleAddService} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Servicio
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
