import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Contact, ContactType } from '@/types/Contact';
import { logger } from "@/utils/productionLogger";

interface PersonRecordSidebarProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
}

export const PersonRecordSidebar = ({ contact, onEdit }: PersonRecordSidebarProps) => {
  const [isRecordDetailsOpen, setIsRecordDetailsOpen] = useState(true);
  const [isListsOpen, setIsListsOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  const handleFieldEdit = (fieldName: string, currentValue: any) => {
    setEditingField(fieldName);
    setFieldValues({ ...fieldValues, [fieldName]: currentValue });
  };

  const handleFieldSave = (fieldName: string) => {
    // Here you would typically make an API call to update the field
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
    type: 'text' | 'textarea' | 'select' | 'email' | 'tel' = 'text',
    options?: { value: string; label: string }[]
  ) => {
    const isEditing = editingField === fieldName;

    return (
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {isEditing ? (
          <div className="space-y-2">
            {type === 'textarea' ? (
              <Textarea
                value={fieldValues[fieldName] || ''}
                onChange={(e) => setFieldValues({ ...fieldValues, [fieldName]: e.target.value })}
                className="h-20 text-xs"
              />
            ) : type === 'select' && options ? (
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
                Guardar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFieldCancel}
                className="h-6 px-2 text-xs"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="group flex items-center justify-between cursor-pointer p-1 rounded hover:bg-neutral-100"
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

  const getContactTypeBadge = (type: ContactType) => {
    const typeColors = {
      marketing: 'hsl(213, 94%, 68%)', // blue
      sales: 'hsl(213, 94%, 68%)', // blue
      franquicia: 'hsl(158, 100%, 38%)', // green
      cliente: 'hsl(4, 86%, 63%)', // red
      prospect: 'hsl(220, 9%, 46%)', // gray
      other: 'hsl(220, 9%, 46%)' // gray
    };
    return typeColors[type] || 'hsl(220, 9%, 46%)';
  };

  const getContactTypeLabel = (type: ContactType) => {
    const typeLabels = {
      marketing: 'Marketing',
      sales: 'Ventas',
      franquicia: 'Franquicia',
      cliente: 'Cliente',
      prospect: 'Prospecto',
      other: 'Otro'
    };
    return typeLabels[type] || 'Other';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Record Details Section */}
      <div>
        <button
          onClick={() => setIsRecordDetailsOpen(!isRecordDetailsOpen)}
          className="flex items-center justify-between w-full p-2 hover:bg-neutral-100 rounded transition-colors"
        >
          <span className="text-sm font-medium">Detalles del Registro</span>
          {isRecordDetailsOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {isRecordDetailsOpen && (
          <div className="mt-3 space-y-4">
            {renderEditableField('name', 'Nombre completo', contact.name)}
            
            {renderEditableField('email', 'Email', contact.email, 'email')}
            
            {renderEditableField('phone', 'Teléfono', contact.phone, 'tel')}
            
            {renderEditableField('company', 'Empresa', contact.company)}
            
            {renderEditableField('position', 'Cargo', contact.position)}

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
              'Método de contacto preferido',
              contact.preferred_contact_method,
              'select',
              [
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Teléfono' },
                { value: 'linkedin', label: 'LinkedIn' }
              ]
            )}

            {renderEditableField('linkedin_url', 'URL de LinkedIn', contact.linkedin_url)}

            {renderEditableField('website_url', 'URL del sitio web', contact.website_url)}

            {renderEditableField('notes', 'Notas', contact.notes, 'textarea')}

            {/* Contact Type Badge */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <div>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: getContactTypeBadge(contact.contact_type),
                    color: getContactTypeBadge(contact.contact_type)
                  }}
                >
                  {getContactTypeLabel(contact.contact_type)}
                </Badge>
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Creado: {new Date(contact.created_at).toLocaleDateString('es-ES')}</div>
                <div>Actualizado: {new Date(contact.updated_at).toLocaleDateString('es-ES')}</div>
                {contact.last_contact_date && (
                  <div>Última interacción: {new Date(contact.last_contact_date).toLocaleDateString('es-ES')}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lists Section */}
      <div>
        <button
          onClick={() => setIsListsOpen(!isListsOpen)}
          className="flex items-center justify-between w-full p-2 hover:bg-neutral-100 rounded transition-colors"
        >
          <span className="text-sm font-medium">Listas</span>
          {isListsOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {isListsOpen && (
          <div className="mt-3">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Plus className="h-3 w-3 mr-2" />
              Agregar a lista
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};