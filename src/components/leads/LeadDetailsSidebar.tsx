import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit2, Plus, Save, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Lead, UpdateLeadData, LeadStatus, LeadPriority, LeadQuality } from '@/types/Lead';
import { LeadStatusBadge } from './LeadStatusBadge';

interface LeadDetailsSidebarProps {
  lead: Lead;
  onUpdate?: (leadId: string, data: UpdateLeadData) => void;
}

export const LeadDetailsSidebar = ({ lead, onUpdate }: LeadDetailsSidebarProps) => {
  const [isRecordDetailsOpen, setIsRecordDetailsOpen] = useState(true);
  const [isListsOpen, setIsListsOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (fieldName: string, value: any): string | null => {
    switch (fieldName) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Email format is invalid';
        }
        break;
      case 'phone':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          return 'Phone format is invalid';
        }
        break;
      case 'lead_score':
        const score = parseInt(value);
        if (value && (isNaN(score) || score < 0 || score > 100)) {
          return 'Lead score must be between 0 and 100';
        }
        break;
      case 'name':
        if (!value || value.trim().length < 2) {
          return 'Name must be at least 2 characters';
        }
        break;
    }
    return null;
  };

  const handleFieldEdit = (fieldName: string, currentValue: any) => {
    setEditingField(fieldName);
    setFieldValues({ ...fieldValues, [fieldName]: currentValue || '' });
    setErrors({ ...errors, [fieldName]: '' });
  };

  const handleFieldSave = async (fieldName: string) => {
    const value = fieldValues[fieldName];
    const error = validateField(fieldName, value);
    
    if (error) {
      setErrors({ ...errors, [fieldName]: error });
      toast.error(error);
      return;
    }

    setIsUpdating(true);
    try {
      if (onUpdate) {
        await onUpdate(lead.id, { [fieldName]: value });
        toast.success('Campo actualizado exitosamente');
      }
      setEditingField(null);
      setErrors({ ...errors, [fieldName]: '' });
    } catch (error: any) {
      toast.error('Error al actualizar: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setFieldValues({});
    setErrors({});
  };

  const handleKeyPress = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFieldSave(fieldName);
    } else if (e.key === 'Escape') {
      handleFieldCancel();
    }
  };

  const renderEditableField = (
    fieldName: string,
    label: string,
    value: any,
    type: 'text' | 'textarea' | 'select' | 'email' | 'tel' | 'number' = 'text',
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
                onKeyDown={(e) => handleKeyPress(e, fieldName)}
                className={`h-20 text-xs ${errors[fieldName] ? 'border-destructive' : ''}`}
                placeholder="Enter text..."
                autoFocus
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
                onKeyDown={(e) => handleKeyPress(e, fieldName)}
                className={`h-8 text-xs ${errors[fieldName] ? 'border-destructive' : ''}`}
                placeholder={`Enter ${label.toLowerCase()}...`}
                autoFocus
              />
            )}
            {errors[fieldName] && (
              <p className="text-xs text-destructive">{errors[fieldName]}</p>
            )}
            <div className="flex gap-1">
              <Button 
                size="sm" 
                onClick={() => handleFieldSave(fieldName)}
                disabled={isUpdating}
                className="h-6 px-2 text-xs gap-1"
              >
                {isUpdating ? (
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                {isUpdating ? 'Saving...' : 'Save'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFieldCancel}
                disabled={isUpdating}
                className="h-6 px-2 text-xs gap-1"
              >
                <X className="h-3 w-3" />
                Cancel
              </Button>
            </div>
            {type !== 'select' && (
              <p className="text-xs text-muted-foreground">
                Press Enter to save, Escape to cancel
              </p>
            )}
          </div>
        ) : (
          <div 
            className="group flex items-center justify-between cursor-pointer p-2 rounded hover:bg-neutral-100 transition-all duration-200 border border-transparent hover:border-border animate-fade-in"
            onClick={() => handleFieldEdit(fieldName, value)}
          >
            <span className="text-sm flex-1 min-w-0">
              {value ? (
                <span className="truncate block">{value}</span>
              ) : (
                <span className="text-muted-foreground italic">Click to set {label.toLowerCase()}</span>
              )}
            </span>
            <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
          </div>
        )}
      </div>
    );
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(158, 100%, 38%)'; // green
    if (score >= 60) return 'hsl(42, 100%, 50%)'; // yellow
    if (score >= 40) return 'hsl(30, 100%, 50%)'; // orange
    return 'hsl(4, 86%, 63%)'; // red
  };

  return (
    <div className="p-4 space-y-4">
      {/* Record Details Section */}
      <div>
        <button
          onClick={() => setIsRecordDetailsOpen(!isRecordDetailsOpen)}
          className="flex items-center justify-between w-full p-2 hover:bg-neutral-100 rounded transition-colors"
        >
          <span className="text-sm font-medium">Lead Details</span>
          {isRecordDetailsOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {isRecordDetailsOpen && (
          <div className="mt-3 space-y-4">
            {renderEditableField('name', 'Full name', lead.name)}
            
            {renderEditableField('email', 'Email', lead.email, 'email')}
            
            {renderEditableField('phone', 'Phone', lead.phone, 'tel')}
            
            {renderEditableField('company_name', 'Company', lead.company_name)}
            
            {renderEditableField('job_title', 'Job title', lead.job_title)}

            {renderEditableField(
              'status',
              'Status',
              lead.status,
              'select',
              [
                { value: 'NEW', label: 'New' },
                { value: 'CONTACTED', label: 'Contacted' },
                { value: 'QUALIFIED', label: 'Qualified' },
                { value: 'DISQUALIFIED', label: 'Disqualified' },
                { value: 'NURTURING', label: 'Nurturing' },
                { value: 'CONVERTED', label: 'Converted' },
                { value: 'LOST', label: 'Lost' }
              ]
            )}

            {renderEditableField(
              'priority',
              'Priority',
              lead.priority,
              'select',
              [
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'URGENT', label: 'Urgent' }
              ]
            )}

            {renderEditableField(
              'quality',
              'Quality',
              lead.quality,
              'select',
              [
                { value: 'POOR', label: 'Poor' },
                { value: 'FAIR', label: 'Fair' },
                { value: 'GOOD', label: 'Good' },
                { value: 'EXCELLENT', label: 'Excellent' }
              ]
            )}

            {renderEditableField('lead_score', 'Lead Score', lead.lead_score, 'number')}

            {renderEditableField('source', 'Source', lead.source)}

            {renderEditableField('message', 'Message', lead.message, 'textarea')}

            {/* Lead Score Badge */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Lead Score</Label>
              <div>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: getLeadScoreColor(lead.lead_score),
                    color: getLeadScoreColor(lead.lead_score)
                  }}
                >
                  {lead.lead_score}/100
                </Badge>
              </div>
            </div>

            {/* Status Badge */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <div>
                <LeadStatusBadge status={lead.status} />
              </div>
            </div>

            {/* Tags */}
            {lead.tags && lead.tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Tags</Label>
                <div className="flex flex-wrap gap-1">
                  {lead.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Created: {new Date(lead.created_at).toLocaleDateString('es-ES')}</div>
                <div>Updated: {new Date(lead.updated_at).toLocaleDateString('es-ES')}</div>
                {lead.first_contact_date && (
                  <div>First contact: {new Date(lead.first_contact_date).toLocaleDateString('es-ES')}</div>
                )}
                {lead.last_contact_date && (
                  <div>Last contact: {new Date(lead.last_contact_date).toLocaleDateString('es-ES')}</div>
                )}
                {lead.conversion_date && (
                  <div>Converted: {new Date(lead.conversion_date).toLocaleDateString('es-ES')}</div>
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
          <span className="text-sm font-medium">Lists</span>
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
              Add to list
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};