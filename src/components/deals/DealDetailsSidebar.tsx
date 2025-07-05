import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit2, Plus, Building2, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/types/Deal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DealDetailsSidebarProps {
  deal: Deal;
  onUpdate?: (dealId: string, data: Partial<Deal>) => void;
}

export const DealDetailsSidebar = ({ deal, onUpdate }: DealDetailsSidebarProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isMetricsOpen, setIsMetricsOpen] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Lead': return 'hsl(213, 94%, 68%)';
      case 'In Progress': return 'hsl(45, 93%, 47%)';
      case 'Won': return 'hsl(158, 100%, 38%)';
      case 'Lost': return 'hsl(4, 86%, 63%)';
      default: return 'hsl(210, 11%, 71%)';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '€0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const handleFieldEdit = (fieldName: string, currentValue: any) => {
    setEditingField(fieldName);
    setFieldValues({ ...fieldValues, [fieldName]: currentValue });
  };

  const handleFieldSave = (fieldName: string) => {
    if (onUpdate) {
      onUpdate(deal.id, { [fieldName]: fieldValues[fieldName] });
    }
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
    type: 'text' | 'select' | 'number' = 'text',
    options?: { value: string; label: string }[]
  ) => {
    const isEditing = editingField === fieldName;

    return (
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
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
      {/* Deal Quick Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Quick Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Stage</span>
            <Badge 
              variant="outline"
              style={{ 
                borderColor: getStageColor(deal.stage),
                color: getStageColor(deal.stage)
              }}
              className="text-xs"
            >
              {deal.stage}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Value</span>
            <span className="text-xs font-medium text-success">
              {formatCurrency(deal.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Probability</span>
            <span className="text-xs font-medium">{deal.probability}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Deal Details Section */}
      <div>
        <button
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="flex items-center justify-between w-full p-2 hover:bg-neutral-100 rounded transition-colors"
        >
          <span className="text-sm font-medium">Deal Details</span>
          {isDetailsOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {isDetailsOpen && (
          <div className="mt-3 space-y-4">
            {renderEditableField('title', 'Deal Name', deal.title)}
            
            {renderEditableField('amount', 'Deal Value (€)', deal.amount, 'number')}
            
            {renderEditableField(
              'stage',
              'Stage',
              deal.stage,
              'select',
              [
                { value: 'Lead', label: 'Lead' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Won', label: 'Won' },
                { value: 'Lost', label: 'Lost' }
              ]
            )}

            {renderEditableField('probability', 'Probability (%)', deal.probability, 'number')}
          </div>
        )}
      </div>

      {/* Company Information */}
      {deal.company && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-xs text-muted-foreground">Name</span>
              <p className="text-sm font-medium">{deal.company.name}</p>
            </div>
            {deal.company.industry && (
              <div>
                <span className="text-xs text-muted-foreground">Industry</span>
                <p className="text-sm">{deal.company.industry}</p>
              </div>
            )}
            {deal.company.website && (
              <div>
                <span className="text-xs text-muted-foreground">Website</span>
                <p className="text-sm">
                  <a 
                    href={deal.company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {deal.company.website}
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deal Metrics */}
      <div>
        <button
          onClick={() => setIsMetricsOpen(!isMetricsOpen)}
          className="flex items-center justify-between w-full p-2 hover:bg-neutral-100 rounded transition-colors"
        >
          <span className="text-sm font-medium">Metrics</span>
          {isMetricsOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {isMetricsOpen && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-lg font-bold text-primary">
                  {Math.ceil((new Date().getTime() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </p>
                <p className="text-xs text-muted-foreground">Days Active</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-lg font-bold text-primary">2</p>
                <p className="text-xs text-muted-foreground">Activities</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Created: {new Date(deal.createdAt).toLocaleDateString('es-ES')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Updated: {new Date(deal.updatedAt).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button variant="outline" size="sm" className="w-full justify-start text-xs">
          <Plus className="h-3 w-3 mr-2" />
          Add to list
        </Button>
      </div>
    </div>
  );
};