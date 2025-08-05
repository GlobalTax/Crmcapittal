import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole, UserRole } from '@/hooks/useUserRole';

interface FieldVisibilityConfig {
  is_visible: boolean;
  is_editable: boolean;
  mask_type: 'none' | 'partial' | 'full';
}

interface UseFieldVisibilityProps {
  tableName: string;
  fieldName: string;
}

const fieldConfigCache = new Map<string, FieldVisibilityConfig>();

export const useFieldVisibility = ({ tableName, fieldName }: UseFieldVisibilityProps) => {
  const { role } = useUserRole();
  const [config, setConfig] = useState<FieldVisibilityConfig>({
    is_visible: true,
    is_editable: false,
    mask_type: 'none'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFieldConfig = async () => {
      if (!role) {
        setLoading(false);
        return;
      }

      const cacheKey = `${tableName}.${fieldName}.${role}`;
      
      // Check cache first
      if (fieldConfigCache.has(cacheKey)) {
        setConfig(fieldConfigCache.get(cacheKey)!);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('field_visibility_config')
          .select('is_visible, is_editable, mask_type')
          .eq('table_name', tableName)
          .eq('field_name', fieldName)
          .eq('role', role)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching field visibility config:', error);
          setLoading(false);
          return;
        }

        const fieldConfig: FieldVisibilityConfig = data ? {
          is_visible: data.is_visible,
          is_editable: data.is_editable,
          mask_type: (data.mask_type as 'none' | 'partial' | 'full') || 'none'
        } : {
          is_visible: true,
          is_editable: false,
          mask_type: 'none'
        };

        fieldConfigCache.set(cacheKey, fieldConfig);
        setConfig(fieldConfig);
      } catch (err) {
        console.error('Error in useFieldVisibility:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFieldConfig();
  }, [tableName, fieldName, role]);

  const getMaskedValue = useMemo(() => {
    return (value: any): string => {
      if (!config.is_visible) return '***';
      if (config.mask_type === 'full') return '***';
      if (config.mask_type === 'none') return String(value || '');
      
      // Partial masking
      const str = String(value || '');
      if (str.length <= 4) return '*'.repeat(str.length);
      
      // Show first 2 and last 2 characters
      return str.slice(0, 2) + '*'.repeat(str.length - 4) + str.slice(-2);
    };
  }, [config]);

  return {
    isVisible: config.is_visible,
    isEditable: config.is_editable,
    maskType: config.mask_type,
    getMaskedValue,
    loading
  };
};