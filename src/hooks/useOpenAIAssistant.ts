import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Operation } from '@/types/Operation';

interface ParseOperationsResult {
  operations: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">[];
  errors: string[];
  confidence: number;
}

interface GenerateEmailResult {
  result: string;
  success: boolean;
}

interface MeetingSummaryResult {
  summary: string[];
  classification: 'cliente' | 'target' | 'prospecto' | 'inversor';
  contact_updates: { interest: Array<'buy' | 'sell' | 'invest' | 'explore'>; capacity: { ticket_min: number | null; ticket_max: number | null } };
  company_updates: { profile: { seller_ready: boolean; buyer_active: boolean } };
  next_actions: string[];
  confidence: number;
}

interface OpenAIRequest {
  type: 'parse_operations' | 'generate_email' | 'analyze_data' | 'generate_proposal' | 'summarize_meeting' | 'backfill_data' | 'consent_request_email';
  prompt: string;
  context?: any;
  options?: any;
}

interface BackfillDataResult {
  contacts_updates: Array<{
    id: string;
    suggested_classification: 'cliente' | 'target' | 'prospecto' | 'inversor';
    suggested_tags: string[];
    suggested_interest: Array<'buy' | 'sell' | 'invest' | 'explore'>;
    confidence: number;
    reasoning: string;
  }>;
  companies_updates: Array<{
    id: string;
    suggested_industry: string;
    suggested_status: string;
    suggested_tags: string[];
    suggested_profile: {
      seller_ready: boolean;
      buyer_active: boolean;
    };
    confidence: number;
    reasoning: string;
  }>;
  warnings: string[];
}

export const useOpenAIAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const callOpenAI = async (request: OpenAIRequest): Promise<any> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('openai-assistant', {
        body: request
      });

      if (error) {
        console.error('OpenAI Assistant error:', error);
        throw new Error(error.message || 'Error calling OpenAI assistant');
      }

      return data;
    } catch (error) {
      console.error('OpenAI Assistant exception:', error);
      toast({
        title: "Error de IA",
        description: "No se pudo procesar la solicitud con IA",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const parseOperationsWithAI = async (text: string): Promise<ParseOperationsResult> => {
    try {
      const result = await callOpenAI({
        type: 'parse_operations',
        prompt: `Analiza este texto y extrae todas las operaciones M&A que encuentres:

${text}

Extrae la información estructurada siguiendo el formato JSON especificado.`
      });

      return {
        operations: result.operations || [],
        errors: result.errors || [],
        confidence: result.confidence || 0
      };
    } catch (error) {
      return {
        operations: [],
        errors: ['Error procesando con IA'],
        confidence: 0
      };
    }
  };

  const generateEmailWithAI = async (
    templateType: string,
    recipientName: string,
    context: any
  ): Promise<GenerateEmailResult> => {
    try {
      const prompt = `Genera un email de ${templateType} para ${recipientName}. 
      
Contexto adicional: ${JSON.stringify(context, null, 2)}

El email debe ser profesional, personalizado y incluir:
- Saludo personalizado
- Contenido relevante según el contexto
- Llamada a la acción clara
- Despedida profesional`;

      const result = await callOpenAI({
        type: 'generate_email',
        prompt,
        context
      });

      return {
        result: result.result || '',
        success: result.success || false
      };
    } catch (error) {
      return {
        result: '',
        success: false
      };
    }
  };

  const analyzeDataWithAI = async (data: any, question: string): Promise<string> => {
    try {
      const result = await callOpenAI({
        type: 'analyze_data',
        prompt: question,
        context: data
      });

      return result.result || 'No se pudo generar el análisis';
    } catch (error) {
      return 'Error analizando datos con IA';
    }
  };

  const generateProposalWithAI = async (companyData: any): Promise<string> => {
    try {
      const result = await callOpenAI({
        type: 'generate_proposal',
        prompt: 'Genera una propuesta comercial personalizada para esta empresa',
        context: companyData
      });

      return result.result || 'No se pudo generar la propuesta';
    } catch (error) {
      return 'Error generando propuesta con IA';
    }
  };

  const summarizeMeetingWithAI = async (transcript: string): Promise<MeetingSummaryResult> => {
    try {
      const prompt = `A partir de esta transcripción de reunión, resume en bullets (máx. 8) y devuelve cambios de clasificación y tags.\n\n\nTranscripción:\n${transcript}\n\n\nDevuelve JSON:\n{\n  "summary": ["..."],\n  "classification": "cliente|target|prospecto|inversor",\n  "contact_updates": {"interest": ["buy|sell|invest|explore"], "capacity": {"ticket_min": null, "ticket_max": null}},\n  "company_updates": {"profile": {"seller_ready": false, "buyer_active": false}},\n  "next_actions": ["..."],\n  "confidence": 0.0\n}`;

      const result = await callOpenAI({
        type: 'summarize_meeting',
        prompt,
      });

      return {
        summary: result.summary || [],
        classification: result.classification || 'prospecto',
        contact_updates: result.contact_updates || { interest: [], capacity: { ticket_min: null, ticket_max: null } },
        company_updates: result.company_updates || { profile: { seller_ready: false, buyer_active: false } },
        next_actions: result.next_actions || [],
        confidence: typeof result.confidence === 'number' ? result.confidence : 0,
      } as MeetingSummaryResult;
    } catch (error) {
      return {
        summary: [],
        classification: 'prospecto',
        contact_updates: { interest: [], capacity: { ticket_min: null, ticket_max: null } },
        company_updates: { profile: { seller_ready: false, buyer_active: false } },
        next_actions: [],
        confidence: 0,
      };
    }
  };

  const backfillDataWithAI = async (data: { contacts: any[], companies: any[] }): Promise<BackfillDataResult> => {
    try {
      const prompt = JSON.stringify(data);

      const result = await callOpenAI({
        type: 'backfill_data',
        prompt,
      });

      return {
        contacts_updates: result.contacts_updates || [],
        companies_updates: result.companies_updates || [],
        warnings: result.warnings || [],
      } as BackfillDataResult;
    } catch (error) {
      return {
        contacts_updates: [],
        companies_updates: [],
        warnings: ['Error procesando backfill con IA'],
      };
    }
  };

  const generateConsentEmailWithAI = async (
    canal: string,
    contactName: string,
    companyName: string,
    additionalContext?: any
  ): Promise<GenerateEmailResult> => {
    try {
      const prompt = `Redacta un email corto y profesional para solicitar consentimiento de comunicación por ${canal} a ${contactName} (empresa ${companyName}), en español, tono cercano y claro, con CTA de confirmación.`;

      const context = {
        canal,
        contact_name: contactName,
        company_name: companyName,
        ...additionalContext
      };

      const result = await callOpenAI({
        type: 'consent_request_email',
        prompt,
        context
      });

      return {
        result: result.result || '',
        success: result.success || false
      };
    } catch (error) {
      return {
        result: '',
        success: false
      };
    }
  };

  return {
    isLoading,
    parseOperationsWithAI,
    generateEmailWithAI,
    analyzeDataWithAI,
    generateProposalWithAI,
    summarizeMeetingWithAI,
    backfillDataWithAI,
    generateConsentEmailWithAI,
  };
};