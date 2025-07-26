import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, ChevronLeft, ChevronRight, User, FileText, Target } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { BuyerInfoStep } from './dialog-steps/BuyerInfoStep';
import { OriginMandateStep } from './dialog-steps/OriginMandateStep';
import { InvestmentPreferencesStep } from './dialog-steps/InvestmentPreferencesStep';
import type { ReconversionFormData } from '@/types/Reconversion';

interface NewReconversionDialogProps {
  onCreateReconversion: (data: Partial<ReconversionFormData>) => Promise<any>;
}

const STEPS = [
  {
    id: 1,
    title: 'Información del Comprador',
    description: 'Datos básicos del comprador y motivo del rechazo',
    icon: <User className="h-4 w-4" />
  },
  {
    id: 2,
    title: 'Mandato de Origen',
    description: 'Selecciona el mandato relacionado (opcional)',
    icon: <FileText className="h-4 w-4" />
  },
  {
    id: 3,
    title: 'Preferencias de Inversión',
    description: 'Sectores, ticket y criterios de inversión',
    icon: <Target className="h-4 w-4" />
  }
];

export function NewReconversionDialog({ onCreateReconversion }: NewReconversionDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<ReconversionFormData>({
    defaultValues: {
      priority: 'medium',
      status: 'active',
      target_sectors: [],
      geographic_preferences: [],
      business_model_preferences: []
    }
  });

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = async () => {
    const { trigger } = form;
    
    switch (currentStep) {
      case 1:
        return await trigger(['company_name', 'contact_name', 'contact_email', 'rejection_reason']);
      case 2:
        return true; // Optional step
      case 3:
        return await trigger(['target_sectors']);
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      nextStep();
    }
  };

  const onSubmit = async (data: ReconversionFormData) => {
    setSubmitting(true);
    try {
      const formattedData = {
        ...data,
        target_sectors: data.target_sectors?.length > 0 ? data.target_sectors : [],
        geographic_preferences: data.geographic_preferences?.length > 0 ? data.geographic_preferences : [],
        business_model_preferences: data.business_model_preferences?.length > 0 ? data.business_model_preferences : []
      };

      const result = await onCreateReconversion(formattedData);
      if (result) {
        setOpen(false);
        setCurrentStep(1);
        form.reset();
        toast.success('Reconversión creada exitosamente');
      }
    } catch (error) {
      console.error('Error creating reconversion:', error);
      toast.error('Error al crear la reconversión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentStep(1);
    form.reset();
  };

  const progressValue = (currentStep / STEPS.length) * 100;
  const currentStepData = STEPS[currentStep - 1];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reconversión
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentStepData.icon}
            Nueva Reconversión - {currentStepData.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {currentStepData.description}
          </p>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Paso {currentStep} de {STEPS.length}</span>
            <span>{Math.round(progressValue)}% completado</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between items-center">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 text-xs ${
                step.id === currentStep
                  ? 'text-primary font-medium'
                  : step.id < currentStep
                  ? 'text-success'
                  : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  step.id === currentStep
                    ? 'border-primary bg-primary text-primary-foreground'
                    : step.id < currentStep
                    ? 'border-success bg-success text-success-foreground'
                    : 'border-muted-foreground'
                }`}
              >
                {step.icon}
              </div>
              <span className="hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 && <BuyerInfoStep form={form} />}
            {currentStep === 2 && <OriginMandateStep form={form} />}
            {currentStep === 3 && <InvestmentPreferencesStep form={form} />}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? handleClose : prevStep}
              disabled={submitting}
            >
              {currentStep === 1 ? (
                <>Cancelar</>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </>
              )}
            </Button>

            <div className="flex gap-2">
              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={submitting}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear Reconversión'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}