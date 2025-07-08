import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ViewType = 'table' | 'pipeline';
type PreferenceKey = 'mandate_view_preference';

export const useViewPreferences = () => {
  const [mandateViewPreference, setMandateViewPreference] = useState<ViewType>('table');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_table_preferences')
        .select('*')
        .eq('user_id', user.id)
        .eq('table_name', 'mandates')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading view preferences:', error);
        // No lanzar error, solo continuar con valores por defecto
        return;
      }

      if (data?.column_preferences) {
        const prefs = data.column_preferences as any;
        if (prefs.view_type) {
          setMandateViewPreference(prefs.view_type);
        }
      }
    } catch (error) {
      console.error('Error loading view preferences:', error);
      // Continuar silenciosamente con valores por defecto
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preference
  const savePreference = useCallback(async (key: PreferenceKey, value: ViewType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const preferences = { view_type: value };

      const { error } = await supabase
        .from('user_table_preferences')
        .upsert({
          user_id: user.id,
          table_name: 'mandates',
          column_preferences: preferences,
        }, {
          onConflict: 'user_id,table_name',
        });

      if (error) throw error;

      if (key === 'mandate_view_preference') {
        setMandateViewPreference(value);
      }
    } catch (error: any) {
      console.error('Error saving view preference:', error);
      // Solo mostrar toast si es un error crítico, no para problemas de estructura
      if (error.code !== '42P01' && error.code !== '42703') {
        toast({
          title: 'Error',
          description: 'No se pudo guardar la preferencia',
          variant: 'destructive',
        });
      }
    }
  }, [toast]);

  // Update mandate view preference
  const updateMandateViewPreference = useCallback(async (view: ViewType) => {
    await savePreference('mandate_view_preference', view);
  }, [savePreference]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    mandateViewPreference,
    updateMandateViewPreference,
    isLoading,
  };
};