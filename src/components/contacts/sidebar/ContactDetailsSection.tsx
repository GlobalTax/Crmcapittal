
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { Contact, ContactType } from '@/types/Contact';
import { logger } from "@/utils/productionLogger";

interface ContactDetailsSectionProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
}

export const ContactDetailsSection = ({ contact, onEdit }: ContactDetailsSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  const handleFieldEdit = (fieldName: string, currentValue: any) => {
    setEditingField(fieldName);
    setFieldValues({ ...fieldValues, [fieldName]: currentValue });
  };

  const handleFieldSave = (fieldName: string) => {
    logger.debug('Saving field', { fieldName, value: fieldValues[fieldName] });
    setEditingField(null);
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setFieldValues({});
  };

  const renderEditableField = (
    fieldName: string,
    label: string,
    value: any,
    type: 'text' | 'select' | 'email' | 'tel' = 'text',
    options?: { value: string; label: string }[]
  ) => {
    const isEditing = editingField === fieldName;

    return (
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {isEditing ? (
          <div className="space-y-2">
            {type === 'select' && options ? (
              <Select
                value={fieldValues[fieldName] || ''}
                onValueChange={(val) => setFieldValues({ ...fieldValues, [fieldName]: val })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={type}
                value={fieldValues[fieldName] || ''}
                onChange={(e) => setFieldValues({ ...fieldValues, [fieldName]: e.target.value })}
                className="h-8 text-xs"
              />
            )}
            <div className="flex gap-1">
              <Button 
                size="sm" 
                onClick={() => handleFieldSave(fieldName)}
                className="h-6 px-2 text-xs"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFieldCancel}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="group flex items-center justify-between cursor-pointer p-2 rounded hover:bg-muted/50"
            onClick={() => handleFieldEdit(fieldName, value)}
          >
            <span className="text-sm">
              {value || <span className="text-muted-foreground">No establecido</span>}
            </span>
            <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-none">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">DETALLES</h3>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {renderEditableField(
              'contact_type',
              'Tipo de contacto',
              contact.contact_type,
              'select',
              [
                { value: 'marketing', label: 'Marketing' },
                { value: 'sales', label: 'Ventas' },
                { value: 'franquicia', label: 'Franquicia' },
                { value: 'cliente', label: 'Cliente' },
                { value: 'prospect', label: 'Prospecto' },
                { value: 'other', label: 'Otro' }
              ]
            )}

            {renderEditableField(
              'contact_priority',
              'Prioridad',
              contact.contact_priority,
              'select',
              [
                { value: 'low', label: 'Baja' },
                { value: 'medium', label: 'Media' },
                { value: 'high', label: 'Alta' }
              ]
            )}

            {renderEditableField('contact_source', 'Origen', contact.contact_source)}

            {renderEditableField(
              'preferred_contact_method',
              'Método de contacto',
              contact.preferred_contact_method,
              'select',
              [
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Teléfono' },
                { value: 'linkedin', label: 'LinkedIn' }
              ]
            )}

            {renderEditableField('linkedin_url', 'LinkedIn', contact.linkedin_url)}
            {renderEditableField('website_url', 'Sitio web', contact.website_url)}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
