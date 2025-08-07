import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentPresence, UpdatePresenceData } from '@/types/DocumentCollaboration';

export const useDocumentPresence = (documentId?: string) => {
  const [presence, setPresence] = useState<DocumentPresence[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchPresence = useCallback(async (signal?: AbortSignal) => {
    if (!documentId) return;

    try {
      const { data, error } = await supabase
        .from('document_presence')
        .select('*')
        .abortSignal(signal)
        .eq('document_id', documentId)
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Últimos 5 minutos

      if (error) throw error;

      const presenceWithUsers = (data || []).map(p => ({
        ...p,
        user: { id: p.user_id, email: '', first_name: '', last_name: '' }
      }));
      if (isMounted.current) {
        setPresence(presenceWithUsers as DocumentPresence[]);
      }
    } catch (error) {
      console.error('Error fetching presence:', error);
    }
  }, [documentId]);

  const updatePresence = useCallback(async (presenceData: UpdatePresenceData, signal?: AbortSignal) => {
    if (!documentId) return;

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { error } = await supabase
        .from('document_presence')
        .upsert({
          document_id: presenceData.document_id,
          user_id: user.data.user.id,
          cursor_position: presenceData.cursor_position,
          selection_data: presenceData.selection_data,
          last_seen: new Date().toISOString()
        }, {
          onConflict: 'document_id,user_id'
        })
        .abortSignal(signal);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [documentId]);

  const removePresence = useCallback(async (signal?: AbortSignal) => {
    if (!documentId) return;

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      await supabase
        .from('document_presence')
        .delete()
        .eq('document_id', documentId)
        .eq('user_id', user.data.user.id)
        .abortSignal(signal);
    } catch (error) {
      console.error('Error removing presence:', error);
    }
  }, [documentId]);

  useEffect(() => {
    const controller = new AbortController();

    const initializePresence = async () => {
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        setCurrentUser(user.data.user.id);
        await updatePresence({ document_id: documentId! }, controller.signal);
      }
    };

    if (documentId) {
      initializePresence();
      fetchPresence(controller.signal);

      // Actualizar presencia cada 30 segundos
      const presenceInterval = setInterval(() => {
        updatePresence({ document_id: documentId }, controller.signal);
      }, 30000);

      // Suscribirse a cambios en tiempo real
      const channel = supabase
        .channel('document-presence')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'document_presence',
            filter: `document_id=eq.${documentId}`
          },
          () => {
            fetchPresence();
          }
        )
        .subscribe();

      // Cleanup al desmontar
      return () => {
        clearInterval(presenceInterval);
        removePresence(controller.signal);
        supabase.removeChannel(channel);
        controller.abort();
        isMounted.current = false;
      };
    }
  }, [documentId, updatePresence, removePresence, fetchPresence]);

  // Obtener otros usuarios activos (excluyendo el usuario actual)
  const activeUsers = presence.filter(p => p.user_id !== currentUser);

  return {
    presence,
    activeUsers,
    updatePresence,
    removePresence
  };
};