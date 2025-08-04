import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DocumentGeneratorService } from '@/services/DocumentGeneratorService';
import type { 
  DocumentTemplate, 
  DocumentVariables, 
  DocumentFormat, 
  GenerateDocumentRequest,
  GeneratedDocument 
} from '@/types/DocumentGenerator';
import type { Deal } from '@/types/Deal';

export const useDocumentGenerator = (deal: Deal) => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  // Fetch available templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .in('template_type', ['nda', 'proposal', 'mandate'])
        .order('template_type');

      if (error) throw error;
      setTemplates((data || []) as DocumentTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get current user data for mapping
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Get user profile data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    return {
      name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user.email?.split('@')[0] || 'Asesor',
      email: user.email || ''
    };
  };

  // Generate document variables from deal
  const generateVariables = async (): Promise<DocumentVariables> => {
    const currentUser = await getCurrentUser();
    return DocumentGeneratorService.mapDealToVariables(deal, currentUser);
  };

  // Generate and download document
  const generateDocument = async (request: GenerateDocumentRequest): Promise<GeneratedDocument | null> => {
    try {
      setGenerating(true);

      // Find template
      const template = templates.find(t => t.id === request.templateId);
      if (!template) {
        throw new Error('Plantilla no encontrada');
      }

      // Get base variables and merge with custom ones
      const baseVariables = await generateVariables();
      const finalVariables = { ...baseVariables, ...request.variables };

      // Generate document
      const generatedDoc = await DocumentGeneratorService.generateDocument(
        template,
        finalVariables,
        request.format
      );

      // Download immediately
      DocumentGeneratorService.downloadDocument(generatedDoc);

      // Save to opportunity if requested
      if (request.saveToOpportunity) {
        await saveDocumentToOpportunity(generatedDoc, template);
      }

      toast({
        title: "Éxito",
        description: `Documento ${template.name} generado correctamente`
      });

      return generatedDoc;
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Error",
        description: "Error al generar el documento",
        variant: "destructive"
      });
      return null;
    } finally {
      setGenerating(false);
    }
  };

  // Save generated document to opportunity
  const saveDocumentToOpportunity = async (
    generatedDoc: GeneratedDocument, 
    template: DocumentTemplate
  ) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Upload to storage
      const fileName = `${user.id}/${deal.id}/${Date.now()}_${generatedDoc.filename}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('deal-documents')
        .upload(fileName, generatedDoc.blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('deal-documents')
        .getPublicUrl(uploadData.path);

      // Create document record
      const { error: insertError } = await supabase
        .from('deal_documents')
        .insert({
          deal_id: deal.id,
          file_name: generatedDoc.filename,
          file_url: publicUrl,
          file_size: generatedDoc.blob.size,
          content_type: generatedDoc.mimeType,
          document_category: template.template_type,
          document_status: 'draft',
          notes: `Documento generado automáticamente desde plantilla: ${template.name}`,
          uploaded_by: user.id
        });

      if (insertError) throw insertError;

    } catch (error) {
      console.error('Error saving document to opportunity:', error);
      // Don't show error toast here as the main generation was successful
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    generating,
    generateDocument,
    generateVariables,
    refetch: fetchTemplates
  };
};