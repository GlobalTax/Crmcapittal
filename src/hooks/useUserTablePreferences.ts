import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserTablePreference {
  id: string;
  user_id: string;
  table_name: string;
  column_preferences: any; // Using any to match Json type from database
  created_at: string;
  updated_at: string;
}

export interface PreferenceData {
  visible_columns?: string[];
  column_order?: string[];
  selected_pipeline_id?: string;
  custom_stages?: Array<{
    id: string;
    name: string;
    color: string;
    order_index: number;
  }>;
}

export const useUserTablePreferences = (tableName: string) => {
  const [preferences, setPreferences] = useState<UserTablePreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_table_preferences')
        .select('*')
        .eq('user_id', user.id)
        .eq('table_name', tableName)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setPreferences(data);
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      setError('Error al cargar las preferencias de usuario');
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  const updatePreferences = useCallback(async (newPreferences: Partial<PreferenceData>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const currentData = (preferences?.column_preferences as PreferenceData) || {};
      const updatedData = { ...currentData, ...newPreferences };

      if (preferences) {
        // Update existing preference
        const { data, error } = await supabase
          .from('user_table_preferences')
          .update({ column_preferences: updatedData })
          .eq('id', preferences.id)
          .select()
          .single();

        if (error) throw error;
        setPreferences(data);
      } else {
        // Create new preference
        const { data, error } = await supabase
          .from('user_table_preferences')
          .insert({
            user_id: user.id,
            table_name: tableName,
            column_preferences: updatedData
          })
          .select()
          .single();

        if (error) throw error;
        setPreferences(data);
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Error updating preferences:', err);
      return { success: false, error: 'Error al guardar las preferencias' };
    }
  }, [preferences, tableName]);

  const resetToDefaults = useCallback(async () => {
    try {
      if (preferences) {
        const { error } = await supabase
          .from('user_table_preferences')
          .delete()
          .eq('id', preferences.id);

        if (error) throw error;
        setPreferences(null);
      }
      return { success: true, error: null };
    } catch (err) {
      console.error('Error resetting preferences:', err);
      return { success: false, error: 'Error al restablecer las preferencias' };
    }
  }, [preferences]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    resetToDefaults,
    refetch: fetchPreferences
  };
};