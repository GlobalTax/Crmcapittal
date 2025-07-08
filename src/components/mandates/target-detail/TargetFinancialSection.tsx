import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Euro, Edit, Check, X } from 'lucide-react';
import { MandateTarget } from '@/types/BuyingMandate';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';

interface TargetFinancialSectionProps {
  target: MandateTarget;
  onUpdate: (target: MandateTarget) => void;
}

export const TargetFinancialSection = ({ target, onUpdate }: TargetFinancialSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    revenues: target.revenues || 0,
    ebitda: target.ebitda || 0,
  });
  
  const { updateTarget } = useBuyingMandates();

  const handleSave = async () => {
    try {
      await updateTarget(target.id, editData);
      setIsEditing(false);
      onUpdate({ ...target, ...editData });
    } catch (error) {
      console.error('Error updating financials:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      revenues: target.revenues || 0,
      ebitda: target.ebitda || 0,
    });
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMultiple = () => {
    if (editData.revenues && editData.ebitda) {
      return (editData.revenues / editData.ebitda).toFixed(1);
    }
    return '0';
  };

  const calculateEbitdaMargin = () => {
    if (editData.revenues && editData.ebitda) {
      return ((editData.ebitda / editData.revenues) * 100).toFixed(1);
    }
    return '0';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Datos Financieros
        </CardTitle>
        {!isEditing && (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="revenues">Facturación Anual (€)</Label>
              <Input
                id="revenues"
                type="number"
                value={editData.revenues}
                onChange={(e) => setEditData(prev => ({ ...prev, revenues: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ebitda">EBITDA (€)</Label>
              <Input
                id="ebitda"
                type="number"
                value={editData.ebitda}
                onChange={(e) => setEditData(prev => ({ ...prev, ebitda: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>

            {editData.revenues > 0 && editData.ebitda > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Múltiplo Revenue/EBITDA:</span>
                  <span className="font-medium">{calculateMultiple()}x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Margen EBITDA:</span>
                  <span className="font-medium">{calculateEbitdaMargin()}%</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Euro className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Facturación</span>
                </div>
                <div className="text-xl font-bold text-blue-900">
                  {target.revenues ? formatCurrency(target.revenues) : '€0'}
                </div>
                <div className="text-xs text-blue-700">Anual</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">EBITDA</span>
                </div>
                <div className="text-xl font-bold text-green-900">
                  {target.ebitda ? formatCurrency(target.ebitda) : '€0'}
                </div>
                <div className="text-xs text-green-700">Estimado</div>
              </div>
            </div>

            {target.revenues && target.ebitda && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Múltiplo Revenue/EBITDA:</span>
                  <span className="font-medium">{(target.revenues / target.ebitda).toFixed(1)}x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Margen EBITDA:</span>
                  <span className="font-medium">{((target.ebitda / target.revenues) * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}

            {(!target.revenues && !target.ebitda) && (
              <div className="text-center py-4 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay datos financieros</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setIsEditing(true)}
                >
                  Añadir Datos
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};