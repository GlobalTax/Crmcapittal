import { useState } from 'react';
import { useRODFormState } from '@/hooks/useRODFormState';
import { StepperNavigation } from '@/components/rod/StepperNavigation';
import { GeneralInfoForm } from '@/components/rod/GeneralInfoForm';
import { MandateForm } from '@/components/rod/MandateForm';
import { LeadForm } from '@/components/rod/LeadForm';
import { GenerationSettingsForm } from '@/components/rod/GenerationSettingsForm';
import { RODPreview } from '@/components/rod/RODPreview';
import { RODHistoryPanel } from '@/components/rod/RODHistoryPanel';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { toast } from 'sonner';
import { RodLog } from '@/types/RodLog';

export default function RODBuilder() {
  const [showHistory, setShowHistory] = useState(false);
  
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
    resetForm,
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

  const handleDuplicateROD = (rodData: RodLog) => {
    try {
      // Reset form and populate with historical data
      resetForm();
      
      // Extract period information from the first deal
      const firstDeal = rodData.deals?.[0];
      if (firstDeal?.period) {
        const [month, year] = firstDeal.period.split('/').map(Number);
        updateGeneralInfo({
          title: `Copia de ROD ${firstDeal.period}`,
          period: { month: month || new Date().getMonth() + 1, year: year || new Date().getFullYear() },
          selectedSubscribers: []
        });
      }

      // Convert deals back to mandates and leads
      const mandates = rodData.deals?.filter(deal => deal.type === 'operation') || [];
      const leads = rodData.deals?.filter(deal => deal.type === 'lead') || [];

      mandates.forEach(mandate => {
        addMandate({
          companyName: mandate.company_name || '',
          sector: mandate.sector || '',
          location: mandate.location || '',
          salesAmount: mandate.value || 0,
          ebitda: mandate.ebitda || 0,
          description: mandate.description || '',
          status: 'active',
          contactName: '',
          contactEmail: '',
          contactPhone: ''
        });
      });

      leads.forEach(lead => {
        addLead({
          companyName: lead.company_name || '',
          sector: lead.sector || '',
          estimatedValue: lead.value || 0,
          leadScore: 0,
          leadSource: 'imported',
          qualificationStatus: 'new',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          notes: lead.description || ''
        });
      });

      toast.success('ROD duplicada exitosamente');
      setShowHistory(false);
    } catch (error) {
      console.error('Error duplicating ROD:', error);
      toast.error('Error al duplicar la ROD');
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

  if (showHistory) {
    return (
      <div className="container mx-auto p-6 h-[calc(100vh-2rem)]">
        <RODHistoryPanel 
          onClose={() => setShowHistory(false)}
          onDuplicate={handleDuplicateROD}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">ROD Builder</h1>
          <p className="text-muted-foreground text-lg">
            Crea reportes de oportunidades de dealflow de forma rápida y profesional
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          Ver Histórico
        </Button>
      </div>

      <StepperNavigation 
        currentStep={currentStep} 
        onStepClick={goToStep} 
      />

      {renderCurrentStep()}
    </div>
  );
}