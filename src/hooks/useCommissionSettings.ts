import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CommissionSettings {
  auto_calculate_commissions?: { enabled: boolean };
  default_commission_percentage?: { percentage: number };
  approval_required?: { enabled: boolean };
  payment_schedule?: { frequency: string };
  notification_settings?: {
    enabled: boolean;
    recipients: string[];
    newCommissionNotifications: boolean;
    dueReminderNotifications: boolean;
    overdueAlertNotifications: boolean;
    reminderDaysBefore: number;
  };
  report_settings?: {
    enabled: boolean;
    frequency: 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
    format: 'excel' | 'pdf';
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
}

export const useCommissionSettings = () => {
  const [settings, setSettings] = useState<CommissionSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('commission_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsMap: CommissionSettings = {};
      data?.forEach(setting => {
        settingsMap[setting.setting_key as keyof CommissionSettings] = setting.setting_value as any;
      });

      setSettings(settingsMap);
    } catch (err) {
      console.error('Error fetching commission settings:', err);
      setError('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('commission_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        [key]: value
      }));

      toast({
        title: "Éxito",
        description: "Configuración actualizada correctamente"
      });
    } catch (err) {
      console.error('Error updating setting:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSetting,
    refetch: fetchSettings
  };
};