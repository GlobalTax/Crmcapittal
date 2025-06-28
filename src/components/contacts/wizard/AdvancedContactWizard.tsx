
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { ContactType } from '@/types/Contact';
import { ContactWizardSteps } from './ContactWizardSteps';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ProfessionalInfoStep } from './steps/ProfessionalInfoStep';
import { MAPreferencesStep } from './steps/MAPreferencesStep';
import { ConfigurationStep } from './steps/ConfigurationStep';

interface AdvancedContactWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WIZARD_STEPS = [
  { id: 1, title: 'Información Básica', description: 'Datos fundamentales' },
  { id: 2, title: 'Info Profesional', description: 'Empresa y cargo' },
  { id: 3, title: 'Preferencias M&A', description: 'Criterios de inversión' },
  { id: 4, title: 'Configuración', description: 'Resumen y guardado' },
];

export const AdvancedContactWizard = ({ open, onOpenChange }: AdvancedContactWizardProps) => {
  const { createContact } = useContacts();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    contact_type: 'other' as ContactType,
    contact_source: '',
    contact_priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
    linkedin_url: '',
    website_url: '',
    preferred_contact_method: 'email',
    time_zone: '',
    language_preference: 'es',
    investment_capacity_min: 0,
    investment_capacity_max: 0,
    sectors_of_interest: [] as string[],
    deal_preferences: '',
    is_active: true,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'El nombre es obligatorio';
      }
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);
      
      // Prepare data for submission with proper typing
      const contactData = {
        ...formData,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        position: formData.position || undefined,
        linkedin_url: formData.linkedin_url || undefined,
        website_url: formData.website_url || undefined,
        notes: formData.notes || undefined,
        time_zone: formData.time_zone || undefined,
        investment_capacity_min: formData.investment_capacity_min || undefined,
        investment_capacity_max: formData.investment_capacity_max || undefined,
        sectors_of_interest: formData.sectors_of_interest.length > 0 ? formData.sectors_of_interest : undefined,
        deal_preferences: formData.deal_preferences ? JSON.parse(formData.deal_preferences) : undefined,
      };

      await createContact(contactData);
      
      // Reset form and close
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        contact_type: 'other' as ContactType,
        contact_source: '',
        contact_priority: 'medium' as 'low' | 'medium' |'high' | 'urgent',
        notes: '',
        linkedin_url: '',
        website_url: '',
        preferred_contact_method: 'email',
        time_zone: '',
        language_preference: 'es',
        investment_capacity_min: 0,
        investment_capacity_max: 0,
        sectors_of_interest: [] as string[],
        deal_preferences: '',
        is_active: true,
      });
      setCurrentStep(1);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            onInputChange={handleInputChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <ProfessionalInfoStep
            formData={formData}
            onInputChange={handleInputChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <MAPreferencesStep
            formData={formData}
            onInputChange={handleInputChange}
            errors={errors}
          />
        );
      case 4:
        return (
          <ConfigurationStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Contacto M&A - Asistente Avanzado</DialogTitle>
        </DialogHeader>

        <ContactWizardSteps currentStep={currentStep} steps={WIZARD_STEPS} />

        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            {currentStep < WIZARD_STEPS.length ? (
              <Button onClick={handleNext}>
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Guardando...' : 'Crear Contacto'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
