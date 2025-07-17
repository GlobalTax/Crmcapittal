import { useState } from 'react';

export interface RODGeneralInfo {
  title: string;
  description: string;
  client: string;
  period: string;
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
      client: '',
      period: '',
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
  };
}