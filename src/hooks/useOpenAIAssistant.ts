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
  type: 'parse_operations' | 'generate_email' | 'analyze_data' | 'generate_proposal' | 'summarize_meeting' | 'backfill_data' | 'consent_request_email' | 'linkedin_contact_message' | 'account_mapping' | 'icp_score' | 'buyer_seller_readiness' | 'segmentation_rules';
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

interface AccountMappingResult {
  missing_roles: string[];
  suggested_titles: string[];
  coverage_analysis: {
    [key: string]: {
      covered: boolean;
      contacts: string[];
    };
  };
  priority_contacts: Array<{
    title: string;
    reasoning: string;
  }>;
  confidence: number;
}

interface ICPScoreResult {
  icp_score: number;
  reasons: string[];
  sector_score: number;
  size_score: number;
  geography_score: number;
  strategic_fit_score: number;
  recommendation: 'high_priority' | 'medium_priority' | 'low_priority';
  confidence: number;
}

interface BuyerSellerReadinessResult {
  buyer_active: boolean;
  seller_ready: boolean;
  buyer_signals: string[];
  seller_signals: string[];
  buyer_score: number;
  seller_score: number;
  reasoning: string;
  confidence: number;
  recommended_approach: 'buy_side_services' | 'sell_side_services' | 'both' | 'neither';
}

interface SegmentationRulesResult {
  rules: Array<{
    name: string;
    description: string;
    criteria: {
      industry?: string[];
      geography?: string[];
      company_size?: string[];
      revenue_range?: { min: number; max: number };
      capacity?: string[];
      other_filters?: string[];
    };
    sql_filter: string;
    estimated_count: number;
    target_audience: string;
  }>;
  total_segments: number;
  overlap_warnings: string[];
  recommendations: string[];
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

  const generateLinkedInMessageWithAI = async (
    contactName: string,
    companyName: string,
    opportunity: 'buy' | 'sell' | 'invest',
    sectorOrRegion: string,
    additionalContext?: any
  ): Promise<GenerateEmailResult> => {
    try {
      const prompt = `Escribe un mensaje breve (≤300 caracteres) para primer contacto con ${contactName} (${companyName}) sobre oportunidades ${opportunity} en ${sectorOrRegion}.`;

      const context = {
        contact_name: contactName,
        company_name: companyName,
        opportunity,
        sector_region: sectorOrRegion,
        ...additionalContext
      };

      const result = await callOpenAI({
        type: 'linkedin_contact_message',
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

  const analyzeAccountMappingWithAI = async (
    companyName: string,
    contacts: Array<{ title?: string; department?: string; name?: string }>
  ): Promise<AccountMappingResult> => {
    try {
      const prompt = `Con los datos de estos contactos de ${companyName}, identifica roles faltantes para cerrar una operación (decision, finance, legal, tech) y sugiere próximos contactos.`;

      const context = {
        company_name: companyName,
        contacts
      };

      const result = await callOpenAI({
        type: 'account_mapping',
        prompt,
        context
      });

      return {
        missing_roles: result.missing_roles || [],
        suggested_titles: result.suggested_titles || [],
        coverage_analysis: result.coverage_analysis || {},
        priority_contacts: result.priority_contacts || [],
        confidence: typeof result.confidence === 'number' ? result.confidence : 0,
      } as AccountMappingResult;
    } catch (error) {
      return {
        missing_roles: [],
        suggested_titles: [],
        coverage_analysis: {},
        priority_contacts: [],
        confidence: 0,
      };
    }
  };

  const calculateICPScoreWithAI = async (
    companyName: string,
    companyData: {
      sector?: string;
      industry?: string;
      revenue?: number;
      employees?: number;
      location?: string;
      description?: string;
      additionalData?: any;
    }
  ): Promise<ICPScoreResult> => {
    try {
      const prompt = `Calcula un ICP score (0–100) para ${companyName} basado en sector, tamaño, geografía y fit estratégico.`;

      const context = {
        company_name: companyName,
        ...companyData
      };

      const result = await callOpenAI({
        type: 'icp_score',
        prompt,
        context
      });

      return {
        icp_score: result.icp_score || 0,
        reasons: result.reasons || [],
        sector_score: result.sector_score || 0,
        size_score: result.size_score || 0,
        geography_score: result.geography_score || 0,
        strategic_fit_score: result.strategic_fit_score || 0,
        recommendation: result.recommendation || 'low_priority',
        confidence: typeof result.confidence === 'number' ? result.confidence : 0,
      } as ICPScoreResult;
    } catch (error) {
      return {
        icp_score: 0,
        reasons: [],
        sector_score: 0,
        size_score: 0,
        geography_score: 0,
        strategic_fit_score: 0,
        recommendation: 'low_priority',
        confidence: 0,
      };
    }
  };

  const analyzeBuyerSellerReadinessWithAI = async (
    companyName: string,
    notesAndSignals: {
      notes?: string;
      signals?: string[];
      recentNews?: string[];
      leadershipChanges?: string[];
      financialSituation?: string;
      additionalData?: any;
    }
  ): Promise<BuyerSellerReadinessResult> => {
    try {
      const prompt = `Con notas y señales, infiere buyer_active y seller_ready (true/false) para ${companyName}.`;

      const context = {
        company_name: companyName,
        ...notesAndSignals
      };

      const result = await callOpenAI({
        type: 'buyer_seller_readiness',
        prompt,
        context
      });

      return {
        buyer_active: result.buyer_active || false,
        seller_ready: result.seller_ready || false,
        buyer_signals: result.buyer_signals || [],
        seller_signals: result.seller_signals || [],
        buyer_score: result.buyer_score || 0,
        seller_score: result.seller_score || 0,
        reasoning: result.reasoning || '',
        confidence: typeof result.confidence === 'number' ? result.confidence : 0,
        recommended_approach: result.recommended_approach || 'neither',
      } as BuyerSellerReadinessResult;
    } catch (error) {
      return {
        buyer_active: false,
        seller_ready: false,
        buyer_signals: [],
        seller_signals: [],
        buyer_score: 0,
        seller_score: 0,
        reasoning: '',
        confidence: 0,
        recommended_approach: 'neither',
      };
    }
  };

  const generateSegmentationRulesWithAI = async (
    criteria: string,
    context: {
      industry?: string;
      geography?: string;
      targetAudience?: 'buy_side' | 'sell_side' | 'both';
      additionalFilters?: string[];
    } = {}
  ): Promise<SegmentationRulesResult> => {
    try {
      const prompt = `Genera reglas (pseudocódigo) para segmentar empresas/contactos por industry, geography, size y capacidad, listas para usarse como filtros dinámicos. Criterios: ${criteria}`;

      const result = await callOpenAI({
        type: 'segmentation_rules',
        prompt,
        context
      });

      return {
        rules: result.rules || [],
        total_segments: result.total_segments || 0,
        overlap_warnings: result.overlap_warnings || [],
        recommendations: result.recommendations || [],
      } as SegmentationRulesResult;
    } catch (error) {
      return {
        rules: [],
        total_segments: 0,
        overlap_warnings: [],
        recommendations: ['Error generando reglas de segmentación con IA'],
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
    generateLinkedInMessageWithAI,
    analyzeAccountMappingWithAI,
    calculateICPScoreWithAI,
    analyzeBuyerSellerReadinessWithAI,
    generateSegmentationRulesWithAI,
  };
};