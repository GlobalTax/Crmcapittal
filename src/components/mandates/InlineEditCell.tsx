import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Edit2 } from 'lucide-react';
import { logger } from '@/utils/productionLogger';

interface InlineEditCellProps {
  value: string | number | undefined;
  type?: 'text' | 'number' | 'email';
  onSave: (value: string | number) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export const InlineEditCell = ({ 
  value, 
  type = 'text', 
  onSave, 
  placeholder,
  className = ""
}: InlineEditCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditValue(value?.toString() || '');
  }, [value]);

  const handleSave = async () => {
    if (editValue === value?.toString()) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const finalValue = type === 'number' && editValue ? Number(editValue) : editValue;
      await onSave(finalValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-1">
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-8 text-sm"
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isSaving}
          className="h-8 w-8 p-0"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          className="h-8 w-8 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center justify-between group cursor-pointer hover:bg-muted/50 px-2 py-1 rounded ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <span className="text-sm">
        {value || <span className="text-muted-foreground italic">Sin especificar</span>}
      </span>
      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};