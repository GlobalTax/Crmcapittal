import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit2, Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/types/Company';
import { einformaService } from '@/services/einformaService';
import { toast } from 'sonner';
import { logger } from '@/utils/productionLogger';

interface CompanyRecordSidebarProps {
  company: Company;
  onEdit?: (company: Company) => void;
}

export const CompanyRecordSidebar = ({ company, onEdit }: CompanyRecordSidebarProps) => {
  const [isRecordDetailsOpen, setIsRecordDetailsOpen] = useState(true);
  const [isListsOpen, setIsListsOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [isEnriching, setIsEnriching] = useState(false);

  const handleFieldEdit = (fieldName: string, currentValue: any) => {
    setEditingField(fieldName);
    setFieldValues({ ...fieldValues, [fieldName]: currentValue });
  };

  const handleFieldSave = (fieldName: string) => {
    // Here you would typically make an API call to update the field
    logger.debug('Saving company field', { fieldName, value: fieldValues[fieldName], companyId: company.id }, 'CompanyRecordSidebar');
    setEditingField(null);
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setFieldValues({});
  };

  const handleEnrichWithEInforma = async () => {
    if (!company.nif) {
      toast.error('La empresa debe tener un NIF/CIF para enriquecer con eInforma');
      return;
    }

    setIsEnriching(true);
    try {
      const result = await einformaService.enrichCompanyWithEInforma(company.nif);
      
      if (result.success) {
        toast.success(result.message);
        // Refresh the page or trigger a data reload
        window.location.reload();
      } else {
        toast.error(result.message || 'Error al enriquecer con eInforma');
      }
    } catch (error) {
      logger.error('Error enriching company with eInforma', { error, companyId: company.id, nif: company.nif }, 'CompanyRecordSidebar');
      toast.error('Error al conectar con eInforma');
    } finally {
      setIsEnriching(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderEditableField = (
    fieldName: string,
    label: string,
    value: any,
    type: 'text' | 'textarea' | 'select' | 'number' = 'text',
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
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFieldCancel}
                className="h-6 px-2 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="group flex items-center justify-between cursor-pointer p-1 rounded hover:bg-neutral-100"
            onClick={() => handleFieldEdit(fieldName, value)}
          >
            <span className="text-sm">
              {value || <span className="text-muted-foreground">Not set</span>}
            </span>
            <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Record Details Section */}
      <div>
        <button
          onClick={() => setIsRecordDetailsOpen(!isRecordDetailsOpen)}
          className="flex items-center justify-between w-full p-2 hover:bg-neutral-100 rounded transition-colors"
        >
          <span className="text-sm font-medium">Record Details</span>
          {isRecordDetailsOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {isRecordDetailsOpen && (
          <div className="mt-3 space-y-4">
            {renderEditableField('name', 'Company name', company.name)}
            
            {renderEditableField('domain', 'Domain', company.domain)}
            
            {renderEditableField(
              'company_status', 
              'Stage', 
              company.company_status,
              'select',
              [
                { value: 'prospecto', label: 'Prospect' },
                { value: 'cliente', label: 'Customer' },
                { value: 'perdida', label: 'Churned' }
              ]
            )}
            
            {renderEditableField('owner_name', 'Owner', company.owner_name || 'Unassigned')}
            
            {renderEditableField(
              'annual_revenue', 
              'ARR', 
              company.annual_revenue ? formatCurrency(company.annual_revenue) : '',
              'number'
            )}
            
            {renderEditableField(
              'company_size',
              'Employee range',
              company.company_size,
              'select',
              [
                { value: '1-10', label: '1-10' },
                { value: '11-50', label: '11-50' },
                { value: '51-200', label: '51-200' },
                { value: '201-500', label: '201-500' },
                { value: '500+', label: '500+' }
              ]
            )}
            
            {renderEditableField('website', 'Website', company.website)}
            
            {renderEditableField('phone', 'Phone', company.phone)}
            
            {renderEditableField('industry', 'Industry', company.industry)}
            
            {renderEditableField('city', 'City', company.city)}
            
            {renderEditableField('country', 'Country', company.country)}
            
            {renderEditableField('description', 'Description', company.description, 'textarea')}
            
            {renderEditableField('nif', 'NIF/CIF', company.nif)}
            
            {renderEditableField('notes', 'Notes', company.notes, 'textarea')}

            {/* eInforma Enrichment Button */}
            <div className="pt-3 border-t border-border">
              <Label className="text-xs text-muted-foreground">Enriquecimiento de datos</Label>
              <Button
                onClick={handleEnrichWithEInforma}
                disabled={isEnriching || !company.nif}
                className="w-full mt-2"
                variant="outline"
                size="sm"
              >
                {isEnriching ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Enriqueciendo...
                  </>
                ) : (
                  <>
                    <Search className="h-3 w-3 mr-2" />
                    Enriquecer con eInforma
                  </>
                )}
              </Button>
              {!company.nif && (
                <p className="text-xs text-muted-foreground mt-1">
                  Se requiere NIF/CIF para usar eInforma
                </p>
              )}
            </div>

            {/* Special Classifications */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Classifications</Label>
              <div className="flex flex-wrap gap-1">
                {company.is_target_account && (
                  <Badge variant="outline" className="text-xs">Target Account</Badge>
                )}
                {company.is_key_account && (
                  <Badge variant="outline" className="text-xs">Key Account</Badge>
                )}
                {company.is_franquicia && (
                  <Badge variant="outline" className="text-xs">Franquicia</Badge>
                )}
                {!company.is_target_account && !company.is_key_account && !company.is_franquicia && (
                  <span className="text-xs text-muted-foreground">No classifications</span>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Created: {new Date(company.created_at).toLocaleDateString('es-ES')}</div>
                <div>Updated: {new Date(company.updated_at).toLocaleDateString('es-ES')}</div>
                {company.last_activity_date && (
                  <div>Last activity: {new Date(company.last_activity_date).toLocaleDateString('es-ES')}</div>
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