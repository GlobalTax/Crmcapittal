import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calculator, DollarSign, Percent, Plus } from 'lucide-react';
import { useCollaborators } from '@/hooks/useCollaborators';
import { useCommissions } from '@/hooks/useCommissions';

export const CommissionCalculator = () => {
  const { collaborators } = useCollaborators();
  const { createCommission } = useCommissions();
  
  const [calculatorData, setCalculatorData] = useState({
    collaborator_id: '',
    source_type: 'deal',
    source_name: '',
    base_amount: '',
    commission_percentage: '',
    fixed_commission: '',
    notes: ''
  });

  const [calculatedAmount, setCalculatedAmount] = useState(0);

  const calculateCommission = () => {
    const baseAmount = Number(calculatorData.base_amount) || 0;
    const percentage = Number(calculatorData.commission_percentage) || 0;
    const fixed = Number(calculatorData.fixed_commission) || 0;
    
    const percentageAmount = (baseAmount * percentage) / 100;
    const total = percentageAmount + fixed;
    
    setCalculatedAmount(total);
  };

  const handleCreateCommission = async () => {
    if (!calculatorData.collaborator_id || calculatedAmount <= 0) {
      return;
    }

    await createCommission({
      collaborator_id: calculatorData.collaborator_id,
      commission_amount: calculatedAmount,
      commission_percentage: Number(calculatorData.commission_percentage) || undefined,
      source_type: calculatorData.source_type,
      source_name: calculatorData.source_name || undefined,
      notes: calculatorData.notes || undefined
    });

    // Reset form
    setCalculatorData({
      collaborator_id: '',
      source_type: 'deal',
      source_name: '',
      base_amount: '',
      commission_percentage: '',
      fixed_commission: '',
      notes: ''
    });
    setCalculatedAmount(0);
  };

  React.useEffect(() => {
    calculateCommission();
  }, [calculatorData.base_amount, calculatorData.commission_percentage, calculatorData.fixed_commission]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de Comisiones
          </CardTitle>
          <CardDescription>
            Calcula y crea comisiones para colaboradores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="collaborator">Colaborador</Label>
              <Select
                value={calculatorData.collaborator_id}
                onValueChange={(value) => 
                  setCalculatorData(prev => ({ ...prev, collaborator_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {collaborators?.map((collaborator) => (
                    <SelectItem key={collaborator.id} value={collaborator.id}>
                      {collaborator.name} - {collaborator.collaborator_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source_type">Tipo de Fuente</Label>
                <Select
                  value={calculatorData.source_type}
                  onValueChange={(value) => 
                    setCalculatorData(prev => ({ ...prev, source_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="deal">Deal</SelectItem>
                    <SelectItem value="mandate">Mandato</SelectItem>
                    <SelectItem value="transaction">Transacción</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="source_name">Nombre de la Fuente</Label>
                <Input
                  id="source_name"
                  placeholder="Ej: Deal ABC Corp"
                  value={calculatorData.source_name}
                  onChange={(e) => 
                    setCalculatorData(prev => ({ ...prev, source_name: e.target.value }))
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Cálculo de Comisión</h4>
              
              <div>
                <Label htmlFor="base_amount">Monto Base</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="base_amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    value={calculatorData.base_amount}
                    onChange={(e) => 
                      setCalculatorData(prev => ({ ...prev, base_amount: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commission_percentage">Porcentaje (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="commission_percentage"
                      type="number"
                      placeholder="0"
                      className="pl-10"
                      value={calculatorData.commission_percentage}
                      onChange={(e) => 
                        setCalculatorData(prev => ({ ...prev, commission_percentage: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fixed_commission">Comisión Fija</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fixed_commission"
                      type="number"
                      placeholder="0.00"
                      className="pl-10"
                      value={calculatorData.fixed_commission}
                      onChange={(e) => 
                        setCalculatorData(prev => ({ ...prev, fixed_commission: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Información adicional sobre la comisión..."
                value={calculatorData.notes}
                onChange={(e) => 
                  setCalculatorData(prev => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultado del cálculo */}
      <Card>
        <CardHeader>
          <CardTitle>Resultado del Cálculo</CardTitle>
          <CardDescription>
            Desglose de la comisión calculada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monto Base:</span>
              <span className="font-medium">
                €{Number(calculatorData.base_amount || 0).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Porcentaje ({calculatorData.commission_percentage || 0}%):
              </span>
              <span className="font-medium">
                €{((Number(calculatorData.base_amount || 0) * Number(calculatorData.commission_percentage || 0)) / 100).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Comisión Fija:</span>
              <span className="font-medium">
                €{Number(calculatorData.fixed_commission || 0).toLocaleString()}
              </span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Comisión:</span>
              <span className="text-2xl font-bold text-primary">
                €{calculatedAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <Button 
            onClick={handleCreateCommission}
            disabled={!calculatorData.collaborator_id || calculatedAmount <= 0}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Comisión
          </Button>

          {calculatedAmount > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Esta comisión se creará con estado "Pendiente" y requerirá aprobación antes del pago.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};