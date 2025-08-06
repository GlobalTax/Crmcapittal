import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Check, X, Euro } from 'lucide-react';
import { toast } from 'sonner';

interface EditableDealValueProps {
  value: number;
  leadId: string;
  onUpdate: (newValue: number) => void;
}

export const EditableDealValue = ({ value, leadId, onUpdate }: EditableDealValueProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = async () => {
    const numericValue = parseFloat(editValue.replace(/[^\d.-]/g, ''));
    
    if (isNaN(numericValue) || numericValue < 0) {
      toast.error('Por favor introduce un valor válido');
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(numericValue);
      setIsEditing(false);
      toast.success('Valor del deal actualizado');
    } catch (error) {
      toast.error('Error al actualizar el valor');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(value.toString());
  };

  if (isEditing) {
    return (
      <div className="text-right">
        <div className="flex items-center gap-2 mb-2">
          <Input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="text-right text-lg font-bold w-32"
            placeholder="0"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              disabled={isUpdating}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isUpdating}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Valor del deal
        </div>
      </div>
    );
  }

  return (
    <div className="text-right group">
      <div className="flex items-center justify-end gap-2 mb-1">
        <div className="text-3xl font-bold text-green-600">
          {formatCurrency(value)}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleEdit}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-sm text-muted-foreground">
        Valor del deal
      </div>
    </div>
  );
};