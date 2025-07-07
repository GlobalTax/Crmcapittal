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

interface OpenAIRequest {
  type: 'parse_operations' | 'generate_email' | 'analyze_data' | 'generate_proposal';
  prompt: string;
  context?: any;
  options?: any;
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

  return {
    isLoading,
    parseOperationsWithAI,
    generateEmailWithAI,
    analyzeDataWithAI,
    generateProposalWithAI
  };
};