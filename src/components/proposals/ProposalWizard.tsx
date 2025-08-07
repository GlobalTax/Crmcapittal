
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send, 
  Eye, 
  FileText,
  User,
  DollarSign,
  Calendar,
  Settings,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateProposalData } from '@/types/Proposal';
import { BasicStep } from './wizard/BasicStep';
import { ContentStep } from './wizard/ContentStep';
import { ClientInfoStep } from './wizard/ClientInfoStep';
import { ServicesStep } from './wizard/ServicesStep';
import { FeesStep } from './wizard/FeesStep';
import { TimelineStep } from './wizard/TimelineStep';
import { TermsStep } from './wizard/TermsStep';
import { VisualStep } from './wizard/VisualStep';
import { PreviewStep } from './wizard/PreviewStep';

interface ProposalWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProposalData) => Promise<void>;
  initialData?: Partial<CreateProposalData>;
}

const WIZARD_STEPS = [
  { id: 'basic', title: 'Básico', icon: FileText, description: 'Información básica y contenido' },
  { id: 'content', title: 'Contenido', icon: FileText, description: 'Editor avanzado WYSIWYG' },
  { id: 'client', title: 'Cliente', icon: User, description: 'Información del cliente y contexto' },
  { id: 'services', title: 'Servicios', icon: FileText, description: 'Catálogo de servicios y productos' },
  { id: 'fees', title: 'Honorarios', icon: DollarSign, description: 'Estructura de precios y pagos' },
  { id: 'timeline', title: 'Cronograma', icon: Calendar, description: 'Fases y entregables del proyecto' },
  { id: 'terms', title: 'Términos', icon: Settings, description: 'Condiciones legales y clausulas' },
  { id: 'visual', title: 'Diseño', icon: Palette, description: 'Personalización visual' },
  { id: 'preview', title: 'Vista Previa', icon: Eye, description: 'Revisión final antes de enviar' }
];

export const ProposalWizard: React.FC<ProposalWizardProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CreateProposalData>({
    title: '',
    description: '',
    currency: 'EUR',
    proposal_type: 'punctual',
    services: [],
    fee_structure: {
      type: 'fixed',
      payment_schedule: []
    },
    timeline: [],
    visual_config: {
      template_id: 'default',
      primary_color: '#3B82F6',
      secondary_color: '#64748B',
      font_family: 'Inter'
    },
    ...initialData
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Validación por paso
  const validateStep = (stepId: string): string[] => {
    const errors: string[] = [];
    
    switch (stepId) {
      case 'basic':
        if (!formData.title?.trim()) errors.push('El título es obligatorio');
        if (!formData.proposal_type) errors.push('El tipo de propuesta es obligatorio');
        break;
        
      case 'client':
        if (!formData.contact_id && !formData.company_id) {
          errors.push('Debe seleccionar al menos un contacto o empresa');
        }
        break;
        
      case 'services':
        if (!formData.services?.length) {
          errors.push('Debe agregar al menos un servicio');
        }
        break;
        
      case 'fees':
        if (!formData.fee_structure?.type) {
          errors.push('Debe seleccionar un tipo de estructura de honorarios');
        }
        if (!formData.total_amount || formData.total_amount <= 0) {
          errors.push('El importe total debe ser mayor a 0');
        }
        break;
        
      case 'timeline':
        if (formData.proposal_type === 'punctual' && !formData.timeline?.length) {
          errors.push('Proyectos puntuales requieren al menos un hito');
        }
        break;
    }
    
    return errors;
  };

  const handleStepChange = (newStep: number) => {
    if (newStep < currentStep) {
      // Permitir retroceder sin validación
      setCurrentStep(newStep);
      return;
    }

    // Validar paso actual antes de avanzar
    const currentStepId = WIZARD_STEPS[currentStep].id;
    const errors = validateStep(currentStepId);
    
    if (errors.length > 0) {
      setValidationErrors({ [currentStepId]: errors });
      toast({
        title: "Errores de validación",
        description: `Corrige los errores en ${WIZARD_STEPS[currentStep].title} antes de continuar`,
        variant: "destructive"
      });
      return;
    }

    setValidationErrors({});
    setCurrentStep(newStep);
  };

  const handleDataChange = (stepData: Partial<CreateProposalData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    
    // Limpiar errores del paso actual cuando se modifican los datos
    const currentStepId = WIZARD_STEPS[currentStep].id;
    if (validationErrors[currentStepId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[currentStepId];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (action: 'draft' | 'send') => {
    // Validar todos los pasos
    const allErrors: Record<string, string[]> = {};
    WIZARD_STEPS.forEach(step => {
      const errors = validateStep(step.id);
      if (errors.length > 0) {
        allErrors[step.id] = errors;
      }
    });

    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      toast({
        title: "Errores de validación",
        description: "Corrige todos los errores antes de continuar",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        status: action === 'send' ? 'sent' : 'draft'
      } as CreateProposalData;
      
      await onSubmit(submitData);
      
      toast({
        title: action === 'send' ? "Propuesta enviada" : "Propuesta guardada",
        description: action === 'send' 
          ? "La propuesta ha sido enviada al cliente exitosamente"
          : "La propuesta ha sido guardada como borrador"
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al procesar la propuesta",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const stepId = WIZARD_STEPS[currentStep].id;
    const stepErrors = validationErrors[stepId] || [];

    switch (stepId) {
      case 'basic':
        return (
          <BasicStep
            data={formData}
            onChange={handleDataChange}
            errors={stepErrors}
          />
        );
      case 'content':
        return (
          <ContentStep
            data={formData}
            onChange={handleDataChange}
            errors={stepErrors}
          />
        );
      case 'client':
        return (
          <ClientInfoStep
            data={formData}
            onChange={handleDataChange}
            errors={stepErrors}
          />
        );
      case 'services':
        return (
          <ServicesStep
            data={formData}
            onChange={handleDataChange}
            errors={stepErrors}
          />
        );
      case 'fees':
        return (
          <FeesStep
            data={formData}
            onChange={handleDataChange}
            errors={stepErrors}
          />
        );
      case 'timeline':
        return (
          <TimelineStep
            data={formData}
            onChange={handleDataChange}
            errors={stepErrors}
          />
        );
      case 'terms':
        return (
          <TermsStep
            data={formData}
            onChange={handleDataChange}
            errors={stepErrors}
          />
        );
      case 'visual':
        return (
          <VisualStep
            data={formData}
            onChange={handleDataChange}
            errors={stepErrors}
          />
        );
      case 'preview':
        return (
          <PreviewStep
            data={formData}
            onEdit={(stepIndex) => setCurrentStep(stepIndex)}
          />
        );
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">
            {initialData.title ? 'Editar Propuesta' : 'Nueva Propuesta Profesional'}
          </DialogTitle>
          
          {/* Progress Bar */}
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Paso {currentStep + 1} de {WIZARD_STEPS.length}</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex flex-wrap gap-2 mt-4">
            {WIZARD_STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const hasErrors = validationErrors[step.id]?.length > 0;
              const StepIcon = step.icon;

              return (
                <Button
                  key={step.id}
                  variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                  size="sm"
                  className={`flex items-center space-x-2 ${hasErrors ? 'border-red-500' : ''}`}
                  onClick={() => handleStepChange(index)}
                  disabled={index > currentStep + 1}
                >
                  <StepIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                  {hasErrors && <Badge variant="destructive" className="ml-1 h-2 w-2 p-0" />}
                </Button>
              );
            })}
          </div>
        </DialogHeader>

        <Separator />

        {/* Step Content */}
        <div className="flex-1 overflow-auto p-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  {React.createElement(WIZARD_STEPS[currentStep].icon, { className: "h-5 w-5 text-blue-600" })}
                </div>
                <div>
                  <CardTitle>{WIZARD_STEPS[currentStep].title}</CardTitle>
                  <CardDescription>{WIZARD_STEPS[currentStep].description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Messages */}
              {validationErrors[WIZARD_STEPS[currentStep].id]?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    Errores que debes corregir:
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors[WIZARD_STEPS[currentStep].id].map((error, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {renderStepContent()}
            </CardContent>
          </Card>
        </div>

        {/* Footer Navigation */}
        <Separator />
        <div className="flex-shrink-0 flex justify-between items-center p-4 bg-gray-50">
          <Button
            variant="outline"
            onClick={() => handleStepChange(currentStep - 1)}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>

          <div className="flex space-x-2">
            {currentStep === WIZARD_STEPS.length - 1 ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSubmit('draft')}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar Borrador</span>
                </Button>
                <Button
                  onClick={() => handleSubmit('send')}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Enviar Propuesta</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={() => handleStepChange(currentStep + 1)}
                className="flex items-center space-x-2"
              >
                <span>Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
