import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreateProposalData } from '@/types/Proposal';
import { AdvancedEditor } from '../editor/AdvancedEditor';
import { ContentPreview } from '../editor/ContentPreview';
import { TEMPLATE_VARIABLES } from '@/types/ProposalTemplate';

interface BasicStepProps {
  data: CreateProposalData;
  onChange: (data: Partial<CreateProposalData>) => void;
  errors: string[];
}

export const BasicStep: React.FC<BasicStepProps> = ({ data, onChange, errors }) => {
  const [showPreview, setShowPreview] = useState(false);
  const validUntilDate = data.valid_until ? new Date(data.valid_until) : undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Información Básica</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Propuesta*</Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Ej: Propuesta de Servicios de Consultoría"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal_type">Tipo de Propuesta*</Label>
              <Select
                value={data.proposal_type}
                onValueChange={(value: 'punctual' | 'recurring') => onChange({ proposal_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="punctual">Puntual</SelectItem>
                  <SelectItem value="recurring">Recurrente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="total_amount">Importe Total</Label>
              <Input
                id="total_amount"
                type="number"
                value={data.total_amount || ''}
                onChange={(e) => onChange({ total_amount: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={data.currency || 'EUR'}
                onValueChange={(value) => onChange({ currency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Válido hasta</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {validUntilDate ? (
                    format(validUntilDate, "PPP", { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={validUntilDate}
                  onSelect={(date) => onChange({ valid_until: date?.toISOString() })}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {errors.length > 0 && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor WYSIWYG */}
      <AdvancedEditor
        value={data.description || ''}
        onChange={(value) => onChange({ description: value })}
        placeholder="Escribe el contenido principal de tu propuesta..."
        variables={TEMPLATE_VARIABLES}
        onPreview={() => setShowPreview(!showPreview)}
        minHeight={400}
      />

      {/* Vista previa */}
      {showPreview && (
        <ContentPreview
          data={data}
          content={data.description || ''}
          onDownload={() => console.log('Descargar PDF')}
          onShare={() => console.log('Compartir')}
          onPrint={() => window.print()}
        />
      )}
    </div>
  );
};