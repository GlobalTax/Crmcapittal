import { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, X, Edit } from "lucide-react";

interface InlineEditCellProps {
  value: any;
  type?: 'text' | 'email' | 'phone' | 'select' | 'date';
  options?: string[];
  onSave: (value: any) => void;
  className?: string;
}

export function InlineEditCell({
  value,
  type = 'text',
  options = [],
  onSave,
  className = ""
}: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving inline edit:', error);
      setEditValue(value || '');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const renderDisplayValue = () => {
    if (!value) return <span className="text-muted-foreground">-</span>;
    
    if (type === 'email') {
      return <a href={`mailto:${value}`} className="text-blue-600 hover:underline">{value}</a>;
    }
    
    if (type === 'phone') {
      return <a href={`tel:${value}`} className="text-blue-600 hover:underline">{value}</a>;
    }
    
    if (type === 'date') {
      return new Date(value).toLocaleDateString();
    }
    
    return String(value);
  };

  const renderEditInput = () => {
    if (type === 'select' && options.length > 0) {
      return (
        <Select
          value={editValue}
          onValueChange={setEditValue}
          disabled={isLoading}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        ref={inputRef}
        type={type === 'date' ? 'date' : type === 'email' ? 'email' : 'text'}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-8"
        disabled={isLoading}
      />
    );
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 min-w-0">
        <div className="flex-1 min-w-0">
          {renderEditInput()}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 -mx-1 -my-0.5 ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <div className="flex-1 min-w-0 truncate">
        {renderDisplayValue()}
      </div>
      <Edit className="h-3 w-3 opacity-0 group-hover:opacity-50 flex-shrink-0" />
    </div>
  );
}