
import { supabase } from '@/integrations/supabase/client';
import { Sector, CreateSectorData, UpdateSectorData } from '@/types/Sector';
import { logger } from '@/utils/logger';

export const fetchSectors = async (): Promise<Sector[]> => {
  try {
    const { data, error } = await supabase
      .from('sectores')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      logger.error('Error fetching sectors:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    logger.error('Error in fetchSectors:', error);
    throw error;
  }
};

export const fetchSectorById = async (id: string): Promise<Sector> => {
  try {
    const { data, error } = await supabase
      .from('sectores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error fetching sector by id:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Error in fetchSectorById:', error);
    throw error;
  }
};

export const createSector = async (sectorData: CreateSectorData): Promise<Sector> => {
  try {
    const { data, error } = await supabase
      .from('sectores')
      .insert(sectorData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating sector:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Error in createSector:', error);
    throw error;
  }
};

export const updateSector = async (id: string, updates: UpdateSectorData): Promise<Sector> => {
  try {
    const { data, error } = await supabase
      .from('sectores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating sector:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Error in updateSector:', error);
    throw error;
  }
};

export const deleteSector = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('sectores')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting sector:', error);
      throw error;
    }
  } catch (error) {
    logger.error('Error in deleteSector:', error);
    throw error;
  }
};
