/**
 * User Profile Hook
 * 
 * Hook for managing user profile data
 */

import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { AuthService } from '../services/AuthService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const userProfile = await AuthService.getUserProfile(userId);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return { error: 'Usuario no autenticado' };
    }

    try {
      setUpdating(true);
      const { data, error } = await AuthService.updateUserProfile(user.id, updates);
      
      if (error) {
        toast.error('Error al actualizar perfil');
        return { error };
      }

      setProfile(data);
      toast.success('Perfil actualizado correctamente');
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar perfil');
      return { error: error instanceof Error ? error.message : 'Error desconocido' };
    } finally {
      setUpdating(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user?.id, fetchProfile]);

  return {
    profile,
    loading,
    updating,
    updateProfile,
    refetchProfile: user?.id ? () => fetchProfile(user.id) : () => {}
  };
};