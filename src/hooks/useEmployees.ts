import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

interface Employee {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  company?: string;
  phone?: string;
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { role } = useUserRole();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Only admins can see all employees
      if (role !== 'admin' && role !== 'superadmin') {
        setEmployees([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, company, phone')
        .order('first_name', { ascending: true });

      if (error) throw error;

      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role !== undefined) {
      fetchEmployees();
    }
  }, [role]);

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees
  };
};