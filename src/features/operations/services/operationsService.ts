import { supabase } from '@/integrations/supabase/client';
import { Operation } from '../types/Operation';
import { CreateOperationData, BulkOperationData } from '../types/OperationData';

export async function fetchOperationsFromDB(role?: string): Promise<Operation[]> {
  try {
    let query = supabase
      .from('operations')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply role-based filtering
    if (role && role !== 'admin' && role !== 'superadmin') {
      const { data: user } = await supabase.auth.getUser();
      if (user.user?.id) {
        query = query.eq('created_by', user.user.id);
      }
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching operations:', error);
      throw new Error(error.message);
    }
    
    return (data || []) as Operation[];
  } catch (error) {
    console.error('Error in fetchOperationsFromDB:', error);
    throw error;
  }
}

export async function insertOperation(operationData: CreateOperationData): Promise<Operation> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('operations')
      .insert({
        ...operationData,
        created_by: user.user?.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting operation:', error);
      throw new Error(error.message);
    }
    
    return data as Operation;
  } catch (error) {
    console.error('Error in insertOperation:', error);
    throw error;
  }
}

export async function updateOperationInDB(id: string, updates: Partial<Operation>): Promise<Operation> {
  try {
    const { data, error } = await supabase
      .from('operations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating operation:', error);
      throw new Error(error.message);
    }
    
    return data as Operation;
  } catch (error) {
    console.error('Error in updateOperationInDB:', error);
    throw error;
  }
}

export async function deleteOperationFromDB(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('operations')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting operation:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error in deleteOperationFromDB:', error);
    throw error;
  }
}

export async function updateOperationStatusInDB(id: string, status: string): Promise<Operation> {
  try {
    const { data, error } = await supabase
      .from('operations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating operation status:', error);
      throw new Error(error.message);
    }
    
    return data as Operation;
  } catch (error) {
    console.error('Error in updateOperationStatusInDB:', error);
    throw error;
  }
}

export async function updateTeaserUrlInDB(id: string, teaserUrl: string): Promise<Operation> {
  try {
    const { data, error } = await supabase
      .from('operations')
      .update({ teaser_url: teaserUrl })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating teaser URL:', error);
      throw new Error(error.message);
    }
    
    return data as Operation;
  } catch (error) {
    console.error('Error in updateTeaserUrlInDB:', error);
    throw error;
  }
}

export async function insertBulkOperations(bulkData: BulkOperationData): Promise<Operation[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    const operationsWithUser = bulkData.operations.map(op => ({
      ...op,
      created_by: user.user?.id
    }));
    
    const { data, error } = await supabase
      .from('operations')
      .insert(operationsWithUser)
      .select();
    
    if (error) {
      console.error('Error inserting bulk operations:', error);
      throw new Error(error.message);
    }
    
    return (data || []) as Operation[];
  } catch (error) {
    console.error('Error in insertBulkOperations:', error);
    throw error;
  }
}