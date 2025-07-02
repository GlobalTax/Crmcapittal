import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Calculator, Plus, Trash2, Calendar, Percent, DollarSign } from 'lucide-react';
import { CreateProposalData, FeeStructure, PaymentSchedule } from '@/types/Proposal';

interface FeesStepProps {
  data: CreateProposalData;
  onChange: (data: Partial<CreateProposalData>) => void;
  errors: string[];
}

export const FeesStep: React.FC<FeesStepProps> = ({ data, onChange, errors }) => {
  const [feeStructure, setFeeStructure] = useState<FeeStructure>(
    data.fee_structure || {
      type: 'fixed',
      payment_schedule: []
    }
  );

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    onChange({ fee_structure: feeStructure });
  }, [feeStructure, onChange]);

  const updateFeeStructure = (updates: Partial<FeeStructure>) => {
    const updatedStructure = { ...feeStructure, ...updates };
    setFeeStructure(updatedStructure);
    
    // Calculate total amount based on fee structure
    let totalAmount = 0;
    switch (updatedStructure.type) {
      case 'fixed':
        totalAmount = updatedStructure.base_amount || 0;
        break;
      case 'hourly':
        totalAmount = (updatedStructure.hourly_rate || 0) * (updatedStructure.estimated_hours || 0);
        break;
      case 'retainer':
        totalAmount = updatedStructure.retainer_amount || 0;
        break;
      case 'mixed':
        totalAmount = (updatedStructure.base_amount || 0) + 
                     ((updatedStructure.hourly_rate || 0) * (updatedStructure.estimated_hours || 0));
        break;
    }
    
    onChange({ total_amount: totalAmount });
  };

  const addPayment = () => {
    const newPayment: PaymentSchedule = {
      id: Date.now().toString(),
      description: 'Pago',
      amount: 0,
      due_date: '',
      percentage: 0
    };
    
    updateFeeStructure({
      payment_schedule: [...feeStructure.payment_schedule, newPayment]
    });
  };

  const updatePayment = (index: number, updates: Partial<PaymentSchedule>) => {
    const payments = [...feeStructure.payment_schedule];
    payments[index] = { ...payments[index], ...updates };
    updateFeeStructure({ payment_schedule: payments });
  };

  const removePayment = (index: number) => {
    const payments = feeStructure.payment_schedule.filter((_, i) => i !== index);
    updateFeeStructure({ payment_schedule: payments });
  };

  const calculatePercentages = () => {
    const totalAmount = data.total_amount || 0;
    if (totalAmount === 0) return;

    const payments = [...feeStructure.payment_schedule];
    const equalPercentage = 100 / payments.length;
    
    payments.forEach((payment, index) => {
      payments[index] = {
        ...payment,
        percentage: equalPercentage,
        amount: (totalAmount * equalPercentage) / 100
      };
    });
    
    updateFeeStructure({ payment_schedule: payments });
  };

  return (
    <div className="space-y-6">
      {/* Tipo de Estructura de Honorarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            <span>Estructura de Honorarios</span>
          </CardTitle>
          <CardDescription>
            Define cómo se calcularán y facturarán los honorarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                type: 'fixed',
                title: 'Precio Fijo',
                description: 'Importe total fijo por el proyecto',
                icon: DollarSign
              },
              {
                type: 'hourly',
                title: 'Por Horas',
                description: 'Facturación basada en tiempo invertido',
                icon: Calendar
              },
              {
                type: 'contingent',
                title: 'Contingente',
                description: 'Porcentaje del resultado obtenido',
                icon: Percent
              },
              {
                type: 'mixed',
                title: 'Mixto',
                description: 'Combinación de fijo + horas',
                icon: Calculator
              }
            ].map((option) => (
              <Card
                key={option.type}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  feeStructure.type === option.type 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200'
                }`}
                onClick={() => updateFeeStructure({ type: option.type as any })}
              >
                <CardContent className="p-4 text-center">
                  <option.icon className={`h-8 w-8 mx-auto mb-2 ${
                    feeStructure.type === option.type ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <h3 className="font-medium text-sm mb-1">{option.title}</h3>
                  <p className="text-xs text-gray-500">{option.description}</p>
                  {feeStructure.type === option.type && (
                    <Badge className="mt-2 text-xs">Seleccionado</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Configuración específica por tipo */}
          {feeStructure.type === 'fixed' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_amount">Importe Total (€) *</Label>
                  <Input
                    id="base_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={feeStructure.base_amount || 0}
                    onChange={(e) => updateFeeStructure({ base_amount: parseFloat(e.target.value) || 0 })}
                    placeholder="Ej: 5000"
                    className={errors.some(e => e.includes('importe')) ? 'border-red-500' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select 
                    value={data.currency || 'EUR'} 
                    onValueChange={(value) => onChange({ currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {feeStructure.type === 'hourly' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Tarifa por Hora (€) *</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={feeStructure.hourly_rate || 0}
                    onChange={(e) => updateFeeStructure({ hourly_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="Ej: 150"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_hours">Horas Estimadas</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={feeStructure.estimated_hours || 0}
                    onChange={(e) => updateFeeStructure({ estimated_hours: parseFloat(e.target.value) || 0 })}
                    placeholder="Ej: 40"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Estimado</Label>
                  <div className="p-2 bg-gray-50 border rounded-md">
                    <p className="text-lg font-bold text-green-600">
                      €{((feeStructure.hourly_rate || 0) * (feeStructure.estimated_hours || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {feeStructure.type === 'contingent' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contingent_percentage">Porcentaje Contingente (%)</Label>
                  <Input
                    id="contingent_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={feeStructure.contingent_percentage || 0}
                    onChange={(e) => updateFeeStructure({ contingent_percentage: parseFloat(e.target.value) || 0 })}
                    placeholder="Ej: 25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_amount">Honorarios Mínimos (€)</Label>
                  <Input
                    id="base_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={feeStructure.base_amount || 0}
                    onChange={(e) => updateFeeStructure({ base_amount: parseFloat(e.target.value) || 0 })}
                    placeholder="Opcional - Honorarios base garantizados"
                  />
                </div>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Honorarios Contingentes</h4>
                <p className="text-sm text-yellow-700">
                  Los honorarios se calcularán como {feeStructure.contingent_percentage || 0}% del resultado obtenido.
                  {feeStructure.base_amount && feeStructure.base_amount > 0 && (
                    ` Honorarios mínimos garantizados: €${feeStructure.base_amount.toLocaleString()}`
                  )}
                </p>
              </div>
            </div>
          )}

          {feeStructure.type === 'mixed' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Componente Fijo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="base_amount_mixed">Importe Base (€)</Label>
                      <Input
                        id="base_amount_mixed"
                        type="number"
                        min="0"
                        step="0.01"
                        value={feeStructure.base_amount || 0}
                        onChange={(e) => updateFeeStructure({ base_amount: parseFloat(e.target.value) || 0 })}
                        placeholder="Ej: 2000"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Componente Variable</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="hourly_rate_mixed">Tarifa/Hora (€)</Label>
                        <Input
                          id="hourly_rate_mixed"
                          type="number"
                          min="0"
                          step="0.01"
                          value={feeStructure.hourly_rate || 0}
                          onChange={(e) => updateFeeStructure({ hourly_rate: parseFloat(e.target.value) || 0 })}
                          placeholder="Ej: 100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estimated_hours_mixed">Horas Est.</Label>
                        <Input
                          id="estimated_hours_mixed"
                          type="number"
                          min="0"
                          step="0.5"
                          value={feeStructure.estimated_hours || 0}
                          onChange={(e) => updateFeeStructure({ estimated_hours: parseFloat(e.target.value) || 0 })}
                          placeholder="20"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-blue-800">Total Estimado</h4>
                    <p className="text-sm text-blue-600">
                      Base: €{(feeStructure.base_amount || 0).toLocaleString()} + 
                      Variable: €{((feeStructure.hourly_rate || 0) * (feeStructure.estimated_hours || 0)).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-900">
                      €{((feeStructure.base_amount || 0) + ((feeStructure.hourly_rate || 0) * (feeStructure.estimated_hours || 0))).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendario de Pagos */}
      {feeStructure.type !== 'contingent' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span>Calendario de Pagos</span>
                </CardTitle>
                <CardDescription>
                  Define cuándo y cómo se realizarán los pagos
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={calculatePercentages}
                  disabled={feeStructure.payment_schedule.length === 0}
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  Auto-calcular
                </Button>
                <Button onClick={addPayment} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Pago
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {feeStructure.payment_schedule.length > 0 ? (
              <div className="space-y-3">
                {feeStructure.payment_schedule.map((payment, index) => (
                  <Card key={payment.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                          <Label htmlFor={`payment_desc_${index}`}>Descripción</Label>
                          <Input
                            id={`payment_desc_${index}`}
                            value={payment.description}
                            onChange={(e) => updatePayment(index, { description: e.target.value })}
                            placeholder="Ej: Pago inicial"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`payment_amount_${index}`}>Importe (€)</Label>
                          <Input
                            id={`payment_amount_${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={payment.amount}
                            onChange={(e) => updatePayment(index, { amount: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`payment_date_${index}`}>Fecha Vencimiento</Label>
                          <Input
                            id={`payment_date_${index}`}
                            type="date"
                            value={payment.due_date}
                            onChange={(e) => updatePayment(index, { due_date: e.target.value })}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {payment.percentage ? `${payment.percentage.toFixed(1)}%` : '0%'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePayment(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="p-4 bg-gray-50 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Programado:</span>
                    <span className="text-lg font-bold text-green-600">
                      €{feeStructure.payment_schedule.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  {data.total_amount && (
                    <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                      <span>Total Propuesta:</span>
                      <span>€{data.total_amount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Sin calendario de pagos</h3>
                <p className="text-sm mb-4">
                  Agrega fechas de pago para estructurar el cobro de honorarios
                </p>
                <Button onClick={addPayment} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Pago
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Opciones Avanzadas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Opciones Avanzadas</CardTitle>
            <Switch
              checked={showAdvancedOptions}
              onCheckedChange={setShowAdvancedOptions}
            />
          </div>
        </CardHeader>
        {showAdvancedOptions && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Descuento por Pronto Pago (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Ej: 5"
                />
              </div>
              <div className="space-y-2">
                <Label>IVA Aplicable (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Ej: 21"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Condiciones Especiales de Pago</Label>
              <Input
                placeholder="Ej: Pago a 30 días fecha factura"
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
