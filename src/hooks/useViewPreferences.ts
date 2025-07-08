import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ViewType = 'table' | 'pipeline';
type PreferenceKey = 'mandate_view_preference';

// Cache para evitar múltiples consultas
const preferencesCache = new Map<string, any>();
let isQueryInProgress = false;

export const useViewPreferences = () => {
  const [mandateViewPreference, setMandateViewPreference] = useState<ViewType>('table');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const hasLoadedRef = useRef(false);

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    // Evitar cargar múltiples veces
    if (hasLoadedRef.current || isQueryInProgress) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        hasLoadedRef.current = true;
        setIsLoading(false);
        return;
      }

      const cacheKey = `${user.id}-mandates`;
      
      // Verificar cache primero
      if (preferencesCache.has(cacheKey)) {
        const cachedData = preferencesCache.get(cacheKey);
        if (cachedData?.view_type) {
          setMandateViewPreference(cachedData.view_type);
        }
        hasLoadedRef.current = true;
        setIsLoading(false);
        return;
      }

      isQueryInProgress = true;

      const { data, error } = await supabase
        .from('user_table_preferences')
        .select('*')
        .eq('user_id', user.id)
        .eq('table_name', 'mandates')
        .maybeSingle();

      // Manejar específicamente el error 406
      if (error) {
        console.log('Error loading preferences, using defaults:', error.code);
        hasLoadedRef.current = true;
        setIsLoading(false);
        return;
      }

      if (data?.column_preferences) {
        const prefs = data.column_preferences as any;
        // Guardar en cache
        preferencesCache.set(cacheKey, prefs);
        if (prefs.view_type) {
          setMandateViewPreference(prefs.view_type);
        }
      }
      
      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading view preferences:', error);
      // Continuar silenciosamente con valores por defecto
      hasLoadedRef.current = true;
    } finally {
      isQueryInProgress = false;
      setIsLoading(false);
    }
  }, []);

  // Save preference
  const savePreference = useCallback(async (key: PreferenceKey, value: ViewType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Still update local state
        if (key === 'mandate_view_preference') {
          setMandateViewPreference(value);
        }
        return;
      }

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

      // Siempre actualizar estado local primero
      if (key === 'mandate_view_preference') {
        setMandateViewPreference(value);
      }

      if (error) {
        console.log('Error saving preferences, but state updated locally:', error.code);
        return;
      }

      // Actualizar cache si el save fue exitoso
      const cacheKey = `${user.id}-mandates`;
      preferencesCache.set(cacheKey, preferences);

    } catch (error: any) {
      console.error('Error saving view preference:', error);
      // Actualizar estado local aunque falle
      if (key === 'mandate_view_preference') {
        setMandateViewPreference(value);
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