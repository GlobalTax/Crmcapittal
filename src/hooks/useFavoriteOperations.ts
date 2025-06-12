
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Operation } from '@/types/Operation';

export const useFavoriteOperations = () => {
  const [favoriteOperations, setFavoriteOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFavoriteOperations = async () => {
    if (!user) {
      setFavoriteOperations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_favorite_operations')
        .select(`
          operation_id,
          operations (
            id,
            company_name,
            sector,
            operation_type,
            amount,
            currency,
            date,
            status,
            description,
            location,
            revenue,
            ebitda,
            annual_growth_rate,
            created_at,
            updated_at,
            teaser_url,
            manager_id,
            operation_managers (
              id,
              name,
              email,
              phone,
              position,
              photo
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorite operations:', error);
        return;
      }

      const operations = data.map(item => ({
        ...item.operations,
        manager: item.operations.operation_managers
      })) as Operation[];

      setFavoriteOperations(operations);
    } catch (error) {
      console.error('Error in fetchFavoriteOperations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (operationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_favorite_operations')
        .insert({
          user_id: user.id,
          operation_id: operationId
        });

      if (error) {
        console.error('Error adding to favorites:', error);
        return;
      }

      await fetchFavoriteOperations();
    } catch (error) {
      console.error('Error in addToFavorites:', error);
    }
  };

  const removeFromFavorites = async (operationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_favorite_operations')
        .delete()
        .eq('user_id', user.id)
        .eq('operation_id', operationId);

      if (error) {
        console.error('Error removing from favorites:', error);
        return;
      }

      await fetchFavoriteOperations();
    } catch (error) {
      console.error('Error in removeFromFavorites:', error);
    }
  };

  const isFavorite = (operationId: string) => {
    return favoriteOperations.some(op => op.id === operationId);
  };

  useEffect(() => {
    fetchFavoriteOperations();
  }, [user]);

  return {
    favoriteOperations,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refetch: fetchFavoriteOperations
  };
};
