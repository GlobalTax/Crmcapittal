import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_manager: boolean;
}

export const useUsers = () => {
  const {
    data: users = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_users_with_roles');
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      return (data || []) as User[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    users,
    isLoading,
    error,
    refetch
  };
};

export const useUser = (userId: string) => {
  const {
    data: user,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    user,
    isLoading,
    error
  };
};