import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Deal } from '@/types/Deal';
import type { DealDocument } from '@/types/DealDocument';

export interface ConversionValidation {
  hasSignedNDA: boolean;
  hasProposalOrMandate: boolean;
  isValid: boolean;
  missingRequirements: string[];
}

export const useClientConversion = (deal: Deal) => {
  const [validating, setValidating] = useState(false);
  const [converting, setConverting] = useState(false);
  const { toast } = useToast();

  // Validate conversion requirements
  const validateConversion = async (): Promise<ConversionValidation> => {
    try {
      setValidating(true);

      // Get deal documents
      const { data: documents, error } = await supabase
        .from('deal_documents')
        .select('*')
        .eq('deal_id', deal.id);

      if (error) throw error;

      const docs = documents as DealDocument[];
      
      // Check for signed NDA
      const hasSignedNDA = docs.some(doc => 
        doc.document_category === 'nda' && doc.document_status === 'signed'
      );

      // Check for proposal or mandate
      const hasProposalOrMandate = docs.some(doc => 
        (doc.document_category === 'proposal' || doc.document_category === 'mandate')
      );

      const missingRequirements: string[] = [];
      if (!hasSignedNDA) {
        missingRequirements.push('NDA firmado');
      }
      if (!hasProposalOrMandate) {
        missingRequirements.push('Propuesta o Mandato');
      }

      return {
        hasSignedNDA,
        hasProposalOrMandate,
        isValid: hasSignedNDA && hasProposalOrMandate && deal.stage !== 'Won',
        missingRequirements
      };
    } catch (error) {
      console.error('Error validating conversion:', error);
      return {
        hasSignedNDA: false,
        hasProposalOrMandate: false,
        isValid: false,
        missingRequirements: ['Error al validar requisitos']
      };
    } finally {
      setValidating(false);
    }
  };

  // Convert opportunity to client
  const convertToClient = async (): Promise<boolean> => {
    try {
      setConverting(true);

      // Validate first
      const validation = await validateConversion();
      if (!validation.isValid) {
        toast({
          title: "No se puede convertir",
          description: `Requisitos faltantes: ${validation.missingRequirements.join(', ')}`,
          variant: "destructive"
        });
        return false;
      }

      // Start transaction-like operations
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // 1. Update deal to Won
      const { error: dealError } = await supabase
        .from('deals')
        .update({ 
          stage: 'Won',
          close_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', deal.id);

      if (dealError) throw dealError;

      // 2. Update contact lifecycle stage to customer
      if (deal.contact?.id) {
        const { error: contactError } = await supabase
          .from('contacts')
          .update({ 
            lifecycle_stage: 'customer',
            updated_at: new Date().toISOString()
          })
          .eq('id', deal.contact.id);

        if (contactError) throw contactError;
      }

      // 3. Update company status to Cliente Activo
      if (deal.company?.name) {
        const { error: companyError } = await supabase
          .from('companies')
          .update({ 
            company_status: 'cliente',
            lifecycle_stage: 'customer',
            updated_at: new Date().toISOString()
          })
          .eq('name', deal.company.name);

        if (companyError) throw companyError;
      }

      // 4. Log conversion activity
      if (deal.contact?.id) {
        const { error: activityError } = await supabase
          .from('contact_activities')
          .insert({
            contact_id: deal.contact.id,
            activity_type: 'conversion',
            title: 'Oportunidad convertida a Cliente',
            description: `La oportunidad "${deal.title}" ha sido convertida exitosamente a cliente`,
            activity_data: {
              deal_id: deal.id,
              deal_title: deal.title,
              deal_amount: deal.amount,
              conversion_date: new Date().toISOString(),
              automated: true
            },
            created_by: user.id
          });

        if (activityError) throw activityError;
      }

      toast({
        title: "¡Conversión exitosa!",
        description: "La oportunidad ha sido convertida a cliente exitosamente",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('Error converting to client:', error);
      toast({
        title: "Error en la conversión",
        description: "No se pudo completar la conversión a cliente",
        variant: "destructive"
      });
      return false;
    } finally {
      setConverting(false);
    }
  };

  return {
    validateConversion,
    convertToClient,
    validating,
    converting,
    canConvert: deal.stage !== 'Won'
  };
};