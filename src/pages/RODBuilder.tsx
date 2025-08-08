import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { StepperNavigation } from '@/components/rod/StepperNavigation';
import { GeneralInfoForm } from '@/components/rod/GeneralInfoForm';
import { MandateForm } from '@/components/rod/MandateForm';
import { LeadForm } from '@/components/rod/LeadForm';
import { GenerationSettingsForm } from '@/components/rod/GenerationSettingsForm';
import { RODPreview } from '@/components/rod/RODPreview';
import { ArrowLeft } from 'lucide-react';
import { useRODFormState } from '@/hooks/useRODFormState';
import { useLocation, useNavigate } from 'react-router-dom';

export const RODBuilder: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    formData,
    currentStep,
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
    resetForm,
  } = useRODFormState();

  // Handle initial state - new ROD or duplication from dashboard
  useEffect(() => {
    const duplicateData = location.state?.duplicateData;
    const isNew = location.state?.isNew;
    
    if (isNew) {
      // For new RODs, ensure completely clean state
      resetForm();
      toast({
        title: "Nueva ROD iniciada",
        description: "Formulario listo para crear un nuevo reporte",
      });
      // Clear the state to prevent re-execution
      navigate('/rod/builder', { replace: true });
    } else if (duplicateData) {
      handleDuplicateROD(duplicateData);
      // Clear the state to prevent re-duplication on refresh
      navigate('/rod/builder', { replace: true });
    }
  }, [location.state, resetForm, navigate, toast]);

  const handleGenerate = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "ROD generada",
        description: "El reporte se ha generado exitosamente. Redirigiendo al dashboard...",
      });
      
      // Auto-redirect to dashboard after successful generation
      setTimeout(() => {
        navigate('/rod');
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al generar la ROD",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateROD = (rodData: any) => {
    resetForm();
    
    // Import the data from the ROD
    if (rodData.deals && rodData.deals.length > 0) {
      const mandates = rodData.deals.filter((deal: any) => deal.dealType === 'mandate');
      const leads = rodData.deals.filter((deal: any) => deal.dealType === 'lead');
      
      if (mandates.length > 0) {
        importMandates(mandates);
      }
      
      if (leads.length > 0) {
        importLeads(leads);
      }
    }
    
    toast({
      title: "ROD duplicada",
      description: "Los datos han sido importados correctamente",
    });
  };

  const handleBackToDashboard = () => {
    navigate('/rod');
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Generador de ROD
            </h1>
            <p className="text-muted-foreground mt-2">
              Crea tu Reporte de Oportunidades de Dealflow paso a paso
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleBackToDashboard}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <StepperNavigation 
            currentStep={currentStep} 
            onStepClick={goToStep}
          />
          
          <div className="mt-8">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RODBuilder;