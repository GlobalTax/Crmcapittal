import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, Eye } from 'lucide-react';
import { TeaserBasicInfo } from './wizard/TeaserBasicInfo';
import { TeaserFinancialInfo } from './wizard/TeaserFinancialInfo';
import { TeaserHighlights } from './wizard/TeaserHighlights';
import { TeaserPreview } from './TeaserPreview';
import type { Database } from '@/integrations/supabase/types';

type Teaser = Database['public']['Tables']['teasers']['Row'];

interface TeaserWizardProps {
  transaccion: any;
  teaser?: any;
  onClose: () => void;
  onSave: (data: Partial<Teaser>) => Promise<void>;
}

const STEPS = [
  { id: 'basic', title: 'Información Básica', description: 'Datos generales de la empresa' },
  { id: 'financial', title: 'Información Financiera', description: 'Métricas y datos económicos' },
  { id: 'highlights', title: 'Puntos Clave', description: 'Destacados de la oportunidad' },
  { id: 'preview', title: 'Vista Previa', description: 'Revisión final del teaser' }
];

export function TeaserWizard({ transaccion, teaser, onClose, onSave }: TeaserWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Teaser>>({
    title: teaser?.title || `Teaser - ${transaccion.nombre_transaccion}`,
    anonymous_company_name: teaser?.anonymous_company_name || '',
    sector: teaser?.sector || transaccion.sector || '',
    location: teaser?.location || transaccion.ubicacion || transaccion.location || '',
    revenue: teaser?.revenue || transaccion.facturacion || transaccion.revenue || null,
    ebitda: teaser?.ebitda || transaccion.ebitda || null,
    employees: teaser?.employees || transaccion.empleados || transaccion.employees || null,
    key_highlights: teaser?.key_highlights || [],
    status: teaser?.status || 'borrador',
    currency: teaser?.currency || 'EUR',
    teaser_type: 'venta',
    asking_price: teaser?.asking_price || null,
    financial_summary: teaser?.financial_summary || null,
    ...teaser
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'basic':
        return (
          <TeaserBasicInfo
            data={formData}
            onChange={updateFormData}
            transaccion={transaccion}
          />
        );
      case 'financial':
        return (
          <TeaserFinancialInfo
            data={formData}
            onChange={updateFormData}
            transaccion={transaccion}
          />
        );
      case 'highlights':
        return (
          <TeaserHighlights
            data={formData}
            onChange={updateFormData}
          />
        );
      case 'preview':
        return <TeaserPreview teaser={formData} />;
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (STEPS[currentStep].id) {
      case 'basic':
        return formData.title && formData.anonymous_company_name;
      case 'financial':
        return true; // Optional step
      case 'highlights':
        return true; // Optional step
      case 'preview':
        return true;
      default:
        return false;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {teaser ? 'Editar Teaser' : 'Crear Teaser'}
            </h2>
            <p className="text-muted-foreground">
              {transaccion.nombre_transaccion}
            </p>
          </div>
        </div>
        {currentStep === STEPS.length - 1 && (
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Teaser'}
          </Button>
        )}
      </div>

      {/* Progress */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-lg">{STEPS[currentStep].title}</CardTitle>
            <span className="text-sm text-muted-foreground">
              Paso {currentStep + 1} de {STEPS.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {STEPS[currentStep].description}
          </p>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      {currentStep < STEPS.length - 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button
            onClick={nextStep}
            disabled={!isStepValid()}
          >
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}