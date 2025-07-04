import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Collaborator, CreateCollaboratorData } from '@/types/Collaborator';
import { useToast } from '@/hooks/use-toast';
import { useDocuments } from '@/hooks/useDocuments';

export const useCollaborators = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { createDocument, templates } = useDocuments();

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollaborators((data || []) as Collaborator[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar colaboradores';
      setError(errorMessage);
      console.error('Error fetching collaborators:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCollaborator = async (data: CreateCollaboratorData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data: newCollaborator, error } = await supabase
        .from('collaborators')
        .insert([{
          ...data,
          created_by: user?.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setCollaborators(prev => [newCollaborator as Collaborator, ...prev]);
      toast({
        title: "Colaborador creado",
        description: "El colaborador ha sido creado correctamente.",
      });
      return newCollaborator as Collaborator;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear colaborador';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateCollaborator = async (id: string, updates: Partial<Collaborator>) => {
    try {
      const { data: updatedCollaborator, error } = await supabase
        .from('collaborators')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCollaborators(prev => 
        prev.map(collaborator => collaborator.id === id ? updatedCollaborator as Collaborator : collaborator)
      );
      toast({
        title: "Colaborador actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
      return updatedCollaborator as Collaborator;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar colaborador';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteCollaborator = async (id: string) => {
    try {
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCollaborators(prev => prev.filter(collaborator => collaborator.id !== id));
      toast({
        title: "Colaborador eliminado",
        description: "El colaborador ha sido eliminado correctamente.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar colaborador';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const generateAgreement = async (collaborator: Collaborator) => {
    try {
      // Verificar que los templates estén cargados
      if (!templates || templates.length === 0) {
        throw new Error('Las plantillas aún no están cargadas. Por favor, espera un momento e inténtalo de nuevo.');
      }

      // Buscar la plantilla del acuerdo de colaboración
      const agreementTemplate = templates.find(t => t.template_type === 'collaboration_agreement');
      
      if (!agreementTemplate) {
        throw new Error('No se encontró la plantilla del acuerdo de colaboración');
      }

      // Crear variables para el documento
      const variables = {
        collaborator_name: collaborator.name,
        collaborator_email: collaborator.email || '',
        collaborator_phone: collaborator.phone || '',
        agreement_date: new Date().toLocaleDateString('es-ES')
      };

      // Crear el documento del acuerdo
      const agreementDoc = await createDocument({
        title: `Acuerdo de Colaboración - ${collaborator.name}`,
        content: agreementTemplate.content,
        template_id: agreementTemplate.id,
        document_type: 'collaboration_agreement',
        variables,
        status: 'draft'
      });

      if (!agreementDoc) {
        throw new Error('Error al crear el documento del acuerdo');
      }

      // Actualizar el colaborador con la información del acuerdo
      const updatedCollaborator = await updateCollaborator(collaborator.id, {
        agreement_id: agreementDoc.id,
        agreement_status: 'generated',
        agreement_date: new Date().toISOString()
      });

      toast({
        title: "Acuerdo generado",
        description: `El acuerdo de colaboración para ${collaborator.name} ha sido generado correctamente.`,
      });

      return agreementDoc;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al generar el acuerdo';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    collaborators,
    loading,
    error,
    createCollaborator,
    updateCollaborator,
    deleteCollaborator,
    generateAgreement,
    refetch: fetchCollaborators
  };
};