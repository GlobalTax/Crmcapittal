import * as React from 'react';
import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Calculator, DollarSign, Percent, Plus, TrendingUp, AlertTriangle } from 'lucide-react';
import { useCollaborators } from '@/hooks/useCollaborators';
import { useCommissions } from '@/hooks/useCommissions';
import { useEmployees } from '@/hooks/useEmployees';

type CalculationType = 'gross' | 'net' | 'mixed';

interface CostBreakdown {
  collaborator_costs: number;
  internal_hours: number;
  hourly_rate: number;
  direct_expenses: number;
  overhead_percentage: number;
}

interface CalculationDetails {
  calculation_type: CalculationType;
  gross_amount: number;
  cost_breakdown?: CostBreakdown;
  net_amount?: number;
  total_costs?: number;
  profit_margin?: number;
}

export const CommissionCalculator = () => {
  const { collaborators } = useCollaborators();
  const { employees } = useEmployees();
  const { createCommission } = useCommissions();
  
  const [calculatorData, setCalculatorData] = useState({
    recipient_type: 'collaborator' as 'collaborator' | 'employee',
    collaborator_id: '',
    employee_id: '',
    source_type: 'deal',
    source_name: '',
    calculation_type: 'gross' as CalculationType,
    base_amount: '',
    commission_percentage: '',
    fixed_commission: '',
    // Cost breakdown fields
    collaborator_costs: '',
    internal_hours: '',
    hourly_rate: '',
    direct_expenses: '',
    overhead_percentage: '',
    notes: ''
  });

  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [calculationDetails, setCalculationDetails] = useState<CalculationDetails | null>(null);

  const calculateCommission = () => {
    const grossAmount = Number(calculatorData.base_amount) || 0;
    const percentage = Number(calculatorData.commission_percentage) || 0;
    const fixed = Number(calculatorData.fixed_commission) || 0;
    
    if (grossAmount <= 0) {
      setCalculatedAmount(0);
      setCalculationDetails(null);
      return;
    }

    let baseForCalculation = grossAmount;
    let details: CalculationDetails = {
      calculation_type: calculatorData.calculation_type,
      gross_amount: grossAmount
    };

    // Calculate based on calculation type
    if (calculatorData.calculation_type === 'net') {
      const collaboratorCosts = Number(calculatorData.collaborator_costs) || 0;
      const internalHours = Number(calculatorData.internal_hours) || 0;
      const hourlyRate = Number(calculatorData.hourly_rate) || 0;
      const directExpenses = Number(calculatorData.direct_expenses) || 0;
      const overheadPercentage = Number(calculatorData.overhead_percentage) || 0;

      const internalLaborCost = internalHours * hourlyRate;
      const overheadCost = (grossAmount * overheadPercentage) / 100;
      const totalCosts = collaboratorCosts + internalLaborCost + directExpenses + overheadCost;
      const netAmount = grossAmount - totalCosts;

      baseForCalculation = Math.max(0, netAmount);
      
      details.cost_breakdown = {
        collaborator_costs: collaboratorCosts,
        internal_hours: internalHours,
        hourly_rate: hourlyRate,
        direct_expenses: directExpenses,
        overhead_percentage: overheadPercentage
      };
      details.total_costs = totalCosts;
      details.net_amount = netAmount;
      details.profit_margin = grossAmount > 0 ? (netAmount / grossAmount) * 100 : 0;
    }

    const percentageAmount = (baseForCalculation * percentage) / 100;
    const total = percentageAmount + fixed;
    
    setCalculatedAmount(total);
    setCalculationDetails(details);
  };

  const handleCreateCommission = async () => {
    const hasValidRecipient = calculatorData.recipient_type === 'collaborator' 
      ? calculatorData.collaborator_id 
      : calculatorData.employee_id;
      
    if (!hasValidRecipient || calculatedAmount <= 0) {
      return;
    }

    // Get recipient name
    let recipientName = '';
    if (calculatorData.recipient_type === 'collaborator') {
      const collaborator = collaborators?.find(c => c.id === calculatorData.collaborator_id);
      recipientName = collaborator?.name || '';
    } else {
      const employee = employees?.find(e => e.id === calculatorData.employee_id);
      recipientName = `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim();
    }

    await createCommission({
      recipient_type: calculatorData.recipient_type,
      collaborator_id: calculatorData.recipient_type === 'collaborator' ? calculatorData.collaborator_id : undefined,
      employee_id: calculatorData.recipient_type === 'employee' ? calculatorData.employee_id : undefined,
      recipient_name: recipientName,
      commission_amount: calculatedAmount,
      commission_percentage: Number(calculatorData.commission_percentage) || undefined,
      source_type: calculatorData.source_type,
      source_name: calculatorData.source_name || undefined,
      notes: calculatorData.notes || undefined,
      calculation_details: calculationDetails
    });

    // Reset form
    setCalculatorData({
      recipient_type: 'collaborator',
      collaborator_id: '',
      employee_id: '',
      source_type: 'deal',
      source_name: '',
      calculation_type: 'gross',
      base_amount: '',
      commission_percentage: '',
      fixed_commission: '',
      collaborator_costs: '',
      internal_hours: '',
      hourly_rate: '',
      direct_expenses: '',
      overhead_percentage: '',
      notes: ''
    });
    setCalculatedAmount(0);
    setCalculationDetails(null);
  };

  React.useEffect(() => {
    calculateCommission();
  }, [
    calculatorData.base_amount, 
    calculatorData.commission_percentage, 
    calculatorData.fixed_commission,
    calculatorData.calculation_type,
    calculatorData.collaborator_costs,
    calculatorData.internal_hours,
    calculatorData.hourly_rate,
    calculatorData.direct_expenses,
    calculatorData.overhead_percentage
  ]);

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
              <Label htmlFor="recipient_type">Tipo de Destinatario</Label>
              <Select
                value={calculatorData.recipient_type}
                onValueChange={(value: 'collaborator' | 'employee') => 
                  setCalculatorData(prev => ({ 
                    ...prev, 
                    recipient_type: value,
                    collaborator_id: '',
                    employee_id: ''
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collaborator">Colaborador</SelectItem>
                  <SelectItem value="employee">Empleado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recipient">
                {calculatorData.recipient_type === 'collaborator' ? 'Colaborador' : 'Empleado'}
              </Label>
              <Select
                value={calculatorData.recipient_type === 'collaborator' ? calculatorData.collaborator_id : calculatorData.employee_id}
                onValueChange={(value) => 
                  setCalculatorData(prev => ({ 
                    ...prev, 
                    [calculatorData.recipient_type === 'collaborator' ? 'collaborator_id' : 'employee_id']: value 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Seleccionar ${calculatorData.recipient_type === 'collaborator' ? 'colaborador' : 'empleado'}`} />
                </SelectTrigger>
                <SelectContent>
                  {calculatorData.recipient_type === 'collaborator' 
                    ? collaborators?.map((collaborator) => (
                        <SelectItem key={collaborator.id} value={collaborator.id}>
                          {collaborator.name} - {collaborator.collaborator_type}
                        </SelectItem>
                      ))
                    : employees?.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </SelectItem>
                      ))
                  }
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
              <h4 className="font-medium">Tipo de Cálculo</h4>
              
              <div>
                <Label htmlFor="calculation_type">Base de Cálculo</Label>
                <Select
                  value={calculatorData.calculation_type}
                  onValueChange={(value: CalculationType) => 
                    setCalculatorData(prev => ({ ...prev, calculation_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gross">Facturación Bruta</SelectItem>
                    <SelectItem value="net">Beneficio Neto</SelectItem>
                    <SelectItem value="mixed">Mixto/Escalado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="base_amount">
                  {calculatorData.calculation_type === 'gross' ? 'Facturación Bruta' : 'Facturación Total'}
                </Label>
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

              {/* Cost breakdown for net calculation */}
              {calculatorData.calculation_type === 'net' && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <h5 className="font-medium text-sm">Desglose de Costos</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="collaborator_costs">Costos de Colaboradores</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="collaborator_costs"
                          type="number"
                          placeholder="0.00"
                          className="pl-10"
                          value={calculatorData.collaborator_costs}
                          onChange={(e) => 
                            setCalculatorData(prev => ({ ...prev, collaborator_costs: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="direct_expenses">Gastos Directos</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="direct_expenses"
                          type="number"
                          placeholder="0.00"
                          className="pl-10"
                          value={calculatorData.direct_expenses}
                          onChange={(e) => 
                            setCalculatorData(prev => ({ ...prev, direct_expenses: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="internal_hours">Horas Internas</Label>
                      <Input
                        id="internal_hours"
                        type="number"
                        placeholder="0"
                        value={calculatorData.internal_hours}
                        onChange={(e) => 
                          setCalculatorData(prev => ({ ...prev, internal_hours: e.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="hourly_rate">Tarifa por Hora</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="hourly_rate"
                          type="number"
                          placeholder="0.00"
                          className="pl-10"
                          value={calculatorData.hourly_rate}
                          onChange={(e) => 
                            setCalculatorData(prev => ({ ...prev, hourly_rate: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="overhead_percentage">Overhead (%)</Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="overhead_percentage"
                        type="number"
                        placeholder="0"
                        className="pl-10"
                        value={calculatorData.overhead_percentage}
                        onChange={(e) => 
                          setCalculatorData(prev => ({ ...prev, overhead_percentage: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Configuración de Comisión</h4>
              
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
            {/* Calculation type badge */}
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {calculatorData.calculation_type === 'gross' && 'Facturación Bruta'}
                {calculatorData.calculation_type === 'net' && 'Beneficio Neto'}
                {calculatorData.calculation_type === 'mixed' && 'Mixto/Escalado'}
              </Badge>
              {calculationDetails?.profit_margin !== undefined && calculationDetails.profit_margin < 20 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Margen bajo
                </Badge>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Facturación Total:</span>
              <span className="font-medium">
                €{Number(calculatorData.base_amount || 0).toLocaleString()}
              </span>
            </div>

            {/* Net calculation breakdown */}
            {calculatorData.calculation_type === 'net' && calculationDetails?.cost_breakdown && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <h6 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Desglose de Costos</h6>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Colaboradores:</span>
                    <span>-€{calculationDetails.cost_breakdown.collaborator_costs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Horas internas ({calculationDetails.cost_breakdown.internal_hours}h × €{calculationDetails.cost_breakdown.hourly_rate}):</span>
                    <span>-€{(calculationDetails.cost_breakdown.internal_hours * calculationDetails.cost_breakdown.hourly_rate).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gastos directos:</span>
                    <span>-€{calculationDetails.cost_breakdown.direct_expenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overhead ({calculationDetails.cost_breakdown.overhead_percentage}%):</span>
                    <span>-€{((Number(calculatorData.base_amount) * calculationDetails.cost_breakdown.overhead_percentage) / 100).toLocaleString()}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total costos:</span>
                    <span>-€{calculationDetails.total_costs?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Beneficio neto:</span>
                    <span className={calculationDetails.net_amount! < 0 ? "text-destructive" : ""}>
                      €{calculationDetails.net_amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Margen:</span>
                    <span className={calculationDetails.profit_margin! < 20 ? "text-destructive" : "text-green-600"}>
                      {calculationDetails.profit_margin?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Base para comisión:</span>
              <span className="font-medium">
                €{calculatorData.calculation_type === 'net' 
                  ? Math.max(0, calculationDetails?.net_amount || 0).toLocaleString()
                  : Number(calculatorData.base_amount || 0).toLocaleString()
                }
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Porcentaje ({calculatorData.commission_percentage || 0}%):
              </span>
              <span className="font-medium">
                €{(((calculatorData.calculation_type === 'net' 
                  ? Math.max(0, calculationDetails?.net_amount || 0)
                  : Number(calculatorData.base_amount || 0)
                ) * Number(calculatorData.commission_percentage || 0)) / 100).toLocaleString()}
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
            disabled={
              (calculatorData.recipient_type === 'collaborator' && !calculatorData.collaborator_id) ||
              (calculatorData.recipient_type === 'employee' && !calculatorData.employee_id) ||
              calculatedAmount <= 0
            }
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