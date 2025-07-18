import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface RODGeneralInfo {
  title: string;
  description: string;
  selectedSubscribers: string[];
  period: {
    month: number;
    year: number;
  };
}

export interface RODMandate {
  id: string;
  companyName: string;
  sector: string;
  location: string;
  salesAmount: number;
  ebitda?: number;
  description: string;
  status: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface RODLead {
  id: string;
  companyName: string;
  sector: string;
  estimatedValue: number;
  leadScore: number;
  leadSource: string;
  qualificationStatus: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
}

export interface RODGenerationSettings {
  template: string;
  outputFormat: string;
  includeLogos: boolean;
  distributionMethod: string;
}

export interface RODFormData {
  generalInfo: RODGeneralInfo;
  mandates: RODMandate[];
  leads: RODLead[];
  generationSettings: RODGenerationSettings;
}

export function useRODFormState() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RODFormData>({
    generalInfo: {
      title: '',
      description: '',
      selectedSubscribers: [],
      period: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
    },
    mandates: [],
    leads: [],
    generationSettings: {
      template: 'professional',
      outputFormat: 'pdf',
      includeLogos: true,
      distributionMethod: 'download',
    },
  });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Auto-save every 5 seconds (only if there's meaningful data)
  useEffect(() => {
    if (!autoSaveEnabled) return;
    
    // Only auto-save if there's actual meaningful data to save
    const hasData = formData.generalInfo.title.trim() !== '' || 
                   formData.mandates.length > 0 || 
                   formData.leads.length > 0;
    
    if (!hasData) return;
    
    const interval = setInterval(() => {
      saveDraft();
    }, 5000);

    return () => clearInterval(interval);
  }, [formData, autoSaveEnabled]);

  const validateAndMigrateData = (data: any): RODFormData => {
    // Ensure selectedSubscribers is always an array
    if (data.generalInfo && !Array.isArray(data.generalInfo.selectedSubscribers)) {
      data.generalInfo.selectedSubscribers = [];
    }
    
    // Validate period structure
    if (!data.generalInfo?.period || typeof data.generalInfo.period.month !== 'number') {
      data.generalInfo = {
        ...data.generalInfo,
        period: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        }
      };
    }
    
    return data;
  };

  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem('rod-builder-draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.formData) {
          const migratedData = validateAndMigrateData(draft.formData);
          setFormData(migratedData);
          setCurrentStep(draft.currentStep || 1);
          toast.info('Borrador cargado automáticamente');
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      // Clear corrupted data
      localStorage.removeItem('rod-builder-draft');
    }
  };

  const saveDraft = () => {
    try {
      const draft = {
        formData,
        currentStep,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('rod-builder-draft', JSON.stringify(draft));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const updateGeneralInfo = (info: Partial<RODGeneralInfo>) => {
    setFormData(prev => ({
      ...prev,
      generalInfo: { ...prev.generalInfo, ...info }
    }));
  };

  const addMandate = (mandate: Omit<RODMandate, 'id'>) => {
    const newMandate = {
      ...mandate,
      id: crypto.randomUUID(),
    };
    setFormData(prev => ({
      ...prev,
      mandates: [...prev.mandates, newMandate]
    }));
  };

  const updateMandate = (id: string, updates: Partial<RODMandate>) => {
    setFormData(prev => ({
      ...prev,
      mandates: prev.mandates.map(mandate => 
        mandate.id === id ? { ...mandate, ...updates } : mandate
      )
    }));
  };

  const removeMandate = (id: string) => {
    setFormData(prev => ({
      ...prev,
      mandates: prev.mandates.filter(mandate => mandate.id !== id)
    }));
  };

  const addLead = (lead: Omit<RODLead, 'id'>) => {
    const newLead = {
      ...lead,
      id: crypto.randomUUID(),
    };
    setFormData(prev => ({
      ...prev,
      leads: [...prev.leads, newLead]
    }));
  };

  const updateLead = (id: string, updates: Partial<RODLead>) => {
    setFormData(prev => ({
      ...prev,
      leads: prev.leads.map(lead => 
        lead.id === id ? { ...lead, ...updates } : lead
      )
    }));
  };

  const removeLead = (id: string) => {
    setFormData(prev => ({
      ...prev,
      leads: prev.leads.filter(lead => lead.id !== id)
    }));
  };

  const updateGenerationSettings = (settings: Partial<RODGenerationSettings>) => {
    setFormData(prev => ({
      ...prev,
      generationSettings: { ...prev.generationSettings, ...settings }
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(Math.max(1, Math.min(step, 5)));
  };

  const importMandates = (mandates: Omit<RODMandate, 'id'>[]) => {
    const newMandates = mandates.map(mandate => ({
      ...mandate,
      id: crypto.randomUUID(),
    }));
    setFormData(prev => ({
      ...prev,
      mandates: [...prev.mandates, ...newMandates]
    }));
    saveDraft();
  };

  const importLeads = (leads: Omit<RODLead, 'id'>[]) => {
    const newLeads = leads.map(lead => ({
      ...lead,
      id: crypto.randomUUID(),
    }));
    setFormData(prev => ({
      ...prev,
      leads: [...prev.leads, ...newLeads]
    }));
    saveDraft();
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem('rod-builder-draft');
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  const resetForm = () => {
    const freshData = {
      generalInfo: {
        title: '',
        description: '',
        selectedSubscribers: [],
        period: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      },
      mandates: [],
      leads: [],
      generationSettings: {
        template: 'professional',
        outputFormat: 'pdf',
        includeLogos: true,
        distributionMethod: 'download',
      },
    };
    setFormData(freshData);
    setCurrentStep(1);
    clearDraft();
  };

  // Function to clear form editing state without affecting global data
  const clearFormState = () => {
    // This can be used by individual forms to clear their editing state
    // without affecting the overall ROD data
    return;
  };

  return {
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
    saveDraft,
    clearDraft,
    clearFormState,
    autoSaveEnabled,
    setAutoSaveEnabled,
    resetForm,
  };
}