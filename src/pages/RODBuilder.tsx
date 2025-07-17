import { useRODFormState } from '@/hooks/useRODFormState';
import { StepperNavigation } from '@/components/rod/StepperNavigation';
import { GeneralInfoForm } from '@/components/rod/GeneralInfoForm';
import { MandateForm } from '@/components/rod/MandateForm';
import { LeadForm } from '@/components/rod/LeadForm';
import { GenerationSettingsForm } from '@/components/rod/GenerationSettingsForm';
import { RODPreview } from '@/components/rod/RODPreview';
import { toast } from 'sonner';

export default function RODBuilder() {
  const {
    currentStep,
    formData,
    updateGeneralInfo,
    addMandate,
    updateMandate,
    removeMandate,
    addLead,
    updateLead,
    removeLead,
    updateGenerationSettings,
    nextStep,
    prevStep,
    goToStep,
    importMandates,
    importLeads,
  } = useRODFormState();

  const handleGenerate = async () => {
    try {
      // Here you would implement the actual ROD generation logic
      // For now, just show a success message
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast.success('ROD generada exitosamente');
    } catch (error) {
      throw error;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <GeneralInfoForm
            initialData={formData.generalInfo}
            onSave={updateGeneralInfo}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <MandateForm
            mandates={formData.mandates}
            onAddMandate={addMandate}
            onUpdateMandate={updateMandate}
            onRemoveMandate={removeMandate}
            onNext={nextStep}
            onPrev={prevStep}
            onImportMandates={importMandates}
          />
        );
      case 3:
        return (
          <LeadForm
            leads={formData.leads}
            onAddLead={addLead}
            onUpdateLead={updateLead}
            onRemoveLead={removeLead}
            onNext={nextStep}
            onPrev={prevStep}
            onImportLeads={importLeads}
          />
        );
      case 4:
        return (
          <GenerationSettingsForm
            initialData={formData.generationSettings}
            onSave={updateGenerationSettings}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <RODPreview
            formData={formData}
            onPrev={prevStep}
            onGenerate={handleGenerate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">ROD Builder</h1>
        <p className="text-muted-foreground text-lg">
          Crea reportes de oportunidades de dealflow de forma rápida y profesional
        </p>
      </div>

      <StepperNavigation 
        currentStep={currentStep} 
        onStepClick={goToStep} 
      />

      {renderCurrentStep()}
    </div>
  );
}