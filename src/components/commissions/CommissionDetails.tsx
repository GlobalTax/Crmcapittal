import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  User, 
  Building,
  AlertTriangle,
  Info,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Commission } from '@/hooks/useCommissions';

interface CommissionDetailsProps {
  commission: Commission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommissionDetails: React.FC<CommissionDetailsProps> = ({
  commission,
  open,
  onOpenChange
}) => {
  if (!commission) return null;

  const calcDetails = commission.calculation_details as any;
  const calculationType = calcDetails?.calculationType || 'gross';
  const recipientName = commission.recipient_name || 
    (commission.recipient_type === 'collaborator' ? commission.collaborators?.name : 'Empleado');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCalculationTypeLabel = (type: string) => {
    switch (type) {
      case 'gross': return 'Facturación Bruta';
      case 'net': return 'Beneficio Neto';
      case 'mixed': return 'Cálculo Mixto';
      default: return 'Facturación Bruta';
    }
  };

  const renderCalculationBreakdown = () => {
    if (!calcDetails || calculationType === 'gross') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cálculo Simple
            </CardTitle>
            <CardDescription>Basado en facturación bruta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Monto base:</span>
              <span className="font-mono">€{calcDetails?.baseAmount?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Porcentaje:</span>
              <span className="font-mono">{commission.commission_percentage || 0}%</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center font-semibold">
              <span>Total comisión:</span>
              <span className="font-mono">€{Number(commission.commission_amount).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Desglose Detallado
          </CardTitle>
          <CardDescription>{getCalculationTypeLabel(calculationType)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ingresos */}
          <div className="space-y-2">
            <h4 className="font-medium text-green-600">Ingresos</h4>
            <div className="flex justify-between items-center text-sm">
              <span>Facturación bruta:</span>
              <span className="font-mono">€{calcDetails.grossRevenue?.toLocaleString() || 'N/A'}</span>
            </div>
          </div>

          {calculationType === 'net' && (
            <>
              {/* Costos */}
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Costos</h4>
                {calcDetails.collaboratorCosts > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Colaboradores:</span>
                    <span className="font-mono">€{calcDetails.collaboratorCosts?.toLocaleString()}</span>
                  </div>
                )}
                {calcDetails.internalHours > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Horas internas ({calcDetails.internalHours}h):</span>
                    <span className="font-mono">€{calcDetails.internalHoursCost?.toLocaleString()}</span>
                  </div>
                )}
                {calcDetails.directExpenses > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Gastos directos:</span>
                    <span className="font-mono">€{calcDetails.directExpenses?.toLocaleString()}</span>
                  </div>
                )}
                {calcDetails.overheadPercentage > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Overhead ({calcDetails.overheadPercentage}%):</span>
                    <span className="font-mono">€{calcDetails.overheadCost?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-medium pt-1 border-t">
                  <span>Total costos:</span>
                  <span className="font-mono">€{calcDetails.totalCosts?.toLocaleString()}</span>
                </div>
              </div>

              {/* Beneficio */}
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">Beneficio</h4>
                <div className="flex justify-between items-center text-sm">
                  <span>Beneficio neto:</span>
                  <span className="font-mono">€{calcDetails.netProfit?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Margen neto:</span>
                  <span className={`font-mono ${calcDetails.netProfitMargin < 20 ? 'text-warning' : 'text-green-600'}`}>
                    {calcDetails.netProfitMargin?.toFixed(1)}%
                  </span>
                </div>
                {calcDetails.netProfitMargin < 20 && (
                  <div className="flex items-center gap-2 text-warning text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Margen inferior al 20%</span>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />
          
          {/* Comisión final */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Base para comisión:</span>
              <span className="font-mono">
                €{(calculationType === 'net' ? calcDetails.netProfit : calcDetails.grossRevenue)?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Porcentaje aplicado:</span>
              <span className="font-mono">{commission.commission_percentage || calcDetails.commissionRate}%</span>
            </div>
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Comisión final:</span>
              <span className="font-mono">€{Number(commission.commission_amount).toLocaleString()}</span>
            </div>
          </div>

          {calculationType === 'net' && calcDetails.netProfitMargin && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Margen de beneficio</span>
                <span>{calcDetails.netProfitMargin.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(calcDetails.netProfitMargin, 100)} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Detalles de Comisión
          </DialogTitle>
          <DialogDescription>
            Información completa y desglose de cálculo
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Información general */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-sm">{commission.id}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Destinatario:</span>
                <div className="text-right">
                  <p className="font-medium">{recipientName}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {commission.recipient_type === 'collaborator' 
                      ? commission.collaborators?.collaborator_type || 'colaborador'
                      : 'empleado'}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estado:</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(commission.status)}`} />
                  <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                    {commission.status === 'paid' ? 'Pagado' : commission.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fuente:</span>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {commission.source_type || 'deal'}
                  </Badge>
                  {commission.source_name && (
                    <p className="text-sm text-muted-foreground">{commission.source_name}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Creada:</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(commission.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                  </span>
                </div>
              </div>

              {commission.payment_due_date && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Vencimiento:</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(commission.payment_due_date), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                </div>
              )}

              {commission.notes && (
                <div className="space-y-2">
                  <span className="text-muted-foreground">Notas:</span>
                  <p className="text-sm bg-muted p-3 rounded-md">{commission.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Desglose de cálculo */}
          {renderCalculationBreakdown()}
        </div>

        {/* Historial de aprobaciones */}
        {commission.approved_at && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Historial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Aprobada el:</span>
                  <span>{format(new Date(commission.approved_at), 'dd MMM yyyy, HH:mm', { locale: es })}</span>
                </div>
                {commission.paid_at && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Pagada el:</span>
                    <span>{format(new Date(commission.paid_at), 'dd MMM yyyy, HH:mm', { locale: es })}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};