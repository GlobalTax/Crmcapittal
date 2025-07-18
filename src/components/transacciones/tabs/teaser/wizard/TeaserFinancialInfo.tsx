import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, Users, Euro } from 'lucide-react';

interface TeaserFinancialInfoProps {
  data: any;
  onChange: (field: string, value: any) => void;
  transaccion: any;
}

export function TeaserFinancialInfo({ data, onChange, transaccion }: TeaserFinancialInfoProps) {
  const calculateMultiple = () => {
    if (data.asking_price && data.ebitda && data.ebitda > 0) {
      return (data.asking_price / data.ebitda).toFixed(1);
    }
    return null;
  };

  const calculateMargin = () => {
    if (data.revenue && data.ebitda && data.revenue > 0) {
      return Math.round((data.ebitda / data.revenue) * 100);
    }
    return null;
  };

  const autoFillFromTransaction = () => {
    if (transaccion.facturacion) onChange('revenue', transaccion.facturacion);
    if (transaccion.ebitda) onChange('ebitda', transaccion.ebitda);
    if (transaccion.empleados) onChange('employees', transaccion.empleados);
    if (transaccion.precio_venta) onChange('asking_price', transaccion.precio_venta);
  };

  return (
    <div className="space-y-6">
      {/* Auto-fill Helper */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Auto-completar desde la transacción</h3>
              <p className="text-sm text-muted-foreground">
                Usar los datos financieros ya registrados en la transacción
              </p>
            </div>
            <Button variant="outline" onClick={autoFillFromTransaction}>
              <Calculator className="w-4 h-4 mr-2" />
              Auto-completar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Financial Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="w-5 h-5" />
              Métricas Principales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="revenue">Facturación Anual</Label>
              <div className="relative">
                <Input
                  id="revenue"
                  type="number"
                  value={data.revenue || ''}
                  onChange={(e) => onChange('revenue', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Facturación en euros"
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">€</span>
              </div>
            </div>

            <div>
              <Label htmlFor="ebitda">EBITDA</Label>
              <div className="relative">
                <Input
                  id="ebitda"
                  type="number"
                  value={data.ebitda || ''}
                  onChange={(e) => onChange('ebitda', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="EBITDA en euros"
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">€</span>
              </div>
              {calculateMargin() && (
                <p className="text-xs text-muted-foreground mt-1">
                  Margen EBITDA: {calculateMargin()}%
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="employees">Número de Empleados</Label>
              <div className="relative">
                <Input
                  id="employees"
                  type="number"
                  value={data.employees || ''}
                  onChange={(e) => onChange('employees', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Cantidad de empleados"
                />
                <Users className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Detalles de Inversión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="asking_price">Precio Orientativo de Venta</Label>
              <div className="relative">
                <Input
                  id="asking_price"
                  type="number"
                  value={data.asking_price || ''}
                  onChange={(e) => onChange('asking_price', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Precio de venta esperado"
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">€</span>
              </div>
              {calculateMultiple() && (
                <p className="text-xs text-muted-foreground mt-1">
                  Múltiplo EBITDA: {calculateMultiple()}x
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="enterprise_value">Valor de Empresa</Label>
              <div className="relative">
                <Input
                  id="enterprise_value"
                  type="number"
                  value={data.enterprise_value || ''}
                  onChange={(e) => onChange('enterprise_value', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Valor de empresa"
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">€</span>
              </div>
            </div>

            <div>
              <Label htmlFor="debt">Deuda Financiera</Label>
              <div className="relative">
                <Input
                  id="debt"
                  type="number"
                  value={data.debt || ''}
                  onChange={(e) => onChange('debt', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Deuda financiera total"
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">€</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="financial_summary">Descripción Financiera Detallada</Label>
            <Textarea
              id="financial_summary"
              value={typeof data.financial_summary === 'string' ? data.financial_summary : ''}
              onChange={(e) => onChange('financial_summary', e.target.value)}
              placeholder="Describe la situación financiera, tendencias, proyecciones y aspectos destacados..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Esta información aparecerá en el teaser para dar contexto a los números
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Display */}
      {(data.revenue || data.ebitda || data.asking_price) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Vista Rápida de Métricas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {data.revenue && (
                <div>
                  <div className="text-lg font-bold">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.revenue)}
                  </div>
                  <div className="text-xs text-muted-foreground">Facturación</div>
                </div>
              )}
              {data.ebitda && (
                <div>
                  <div className="text-lg font-bold">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.ebitda)}
                  </div>
                  <div className="text-xs text-muted-foreground">EBITDA</div>
                </div>
              )}
              {calculateMargin() && (
                <div>
                  <div className="text-lg font-bold">{calculateMargin()}%</div>
                  <div className="text-xs text-muted-foreground">Margen</div>
                </div>
              )}
              {calculateMultiple() && (
                <div>
                  <div className="text-lg font-bold">{calculateMultiple()}x</div>
                  <div className="text-xs text-muted-foreground">Múltiplo</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}