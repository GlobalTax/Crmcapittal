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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
        if (error.code === '406' || error.message?.includes('406')) {
          console.log('406 error - usando preferencias por defecto');
          // Usar valores por defecto sin mostrar error
          hasLoadedRef.current = true;
          setIsLoading(false);
          return;
        }
        
        if (error.code !== 'PGRST116') {
          console.error('Error loading view preferences:', error);
          // No lanzar error, solo continuar con valores por defecto
          hasLoadedRef.current = true;
          setIsLoading(false);
          return;
        }
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

      // Manejar específicamente error 406 en save también
      if (error) {
        if (error.code === '406' || error.message?.includes('406')) {
          console.log('406 error al guardar - operación silenciosa');
          // Actualizar estado local aunque falle guardar
          if (key === 'mandate_view_preference') {
            setMandateViewPreference(value);
          }
          return;
        }
        throw error;
      }

      // Actualizar cache si el save fue exitoso
      const cacheKey = `${user.id}-mandates`;
      preferencesCache.set(cacheKey, preferences);

      if (key === 'mandate_view_preference') {
        setMandateViewPreference(value);
      }
    } catch (error: any) {
      console.error('Error saving view preference:', error);
      // Solo mostrar toast si es un error crítico, no para problemas de estructura o 406
      if (error.code !== '42P01' && error.code !== '42703' && error.code !== '406') {
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