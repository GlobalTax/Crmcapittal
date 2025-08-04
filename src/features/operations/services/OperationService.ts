/**
 * Operations Service
 * 
 * Service layer for operations CRUD operations and business logic
 */

import { supabase } from '@/integrations/supabase/client';
import { Operation, CreateOperationData, BulkOperationData } from '../types';

export class OperationService {
  /**
   * Fetch operations from database with manager information
   */
  static async fetchOperations(role?: string): Promise<Operation[]> {
    console.log('Iniciando consulta optimizada de operaciones con join de managers...');
    
    let query = supabase
      .from('operations')
      .select(`
        *,
        operation_managers!manager_id(
          id,
          name,
          email,
          phone,
          position,
          photo
        )
      `)
      .order('created_at', { ascending: false });

    // Si el usuario no es admin, solo mostrar operaciones disponibles
    if (role !== 'admin' && role !== 'superadmin') {
      query = query.eq('status', 'available');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error en la consulta:', error);
      throw error;
    }

    console.log('Datos obtenidos de la consulta:', data?.length, 'operaciones');

    // Procesar y mapear los datos de manera optimizada
    const typedOperations: Operation[] = (data || []).map(op => {
      console.log('Procesando operación:', op.company_name);
      
      // Manejar el caso donde operation_managers puede ser null o undefined
      let managerData = undefined;
      if (op.operation_managers && typeof op.operation_managers === 'object' && op.operation_managers.id) {
        managerData = {
          id: op.operation_managers.id,
          name: op.operation_managers.name,
          email: op.operation_managers.email,
          phone: op.operation_managers.phone,
          position: op.operation_managers.position,
          photo: op.operation_managers.photo
        };
      }
      
      return {
        ...op,
        operation_type: op.operation_type as Operation['operation_type'],
        status: op.status as Operation['status'],
        manager: managerData
      };
    });

    console.log('Operaciones procesadas exitosamente:', typedOperations.length);
    return typedOperations;
  }

  /**
   * Insert a single operation
   */
  static async insertOperation(operationData: CreateOperationData, userId: string): Promise<Operation> {
    console.log('Añadiendo operación con datos:', operationData);
    console.log('Usuario actual:', userId);

    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const insertData = {
      company_name: operationData.company_name,
      project_name: operationData.project_name || null,
      cif: operationData.cif || null,
      sector: operationData.sector,
      operation_type: operationData.operation_type,
      amount: operationData.amount,
      revenue: operationData.revenue || null,
      ebitda: operationData.ebitda || null,
      currency: operationData.currency,
      date: operationData.date,
      buyer: operationData.buyer || null,
      seller: operationData.seller || null,
      status: operationData.status,
      description: operationData.description || null,
      location: operationData.location || null,
      contact_email: operationData.contact_email || null,
      contact_phone: operationData.contact_phone || null,
      annual_growth_rate: operationData.annual_growth_rate || null,
      created_by: userId
    };

    console.log('Datos preparados para inserción:', insertData);

    const { data, error } = await supabase
      .from('operations')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error en la inserción:', error);
      throw error;
    }

    console.log('Operación creada exitosamente:', data);
    return data as Operation;
  }

  /**
   * Insert multiple operations in bulk
   */
  static async insertBulkOperations(operationsData: BulkOperationData[], userId: string): Promise<Operation[]> {
    console.log('Añadiendo operaciones en lote:', operationsData.length);

    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    const insertDataArray = operationsData.map(operationData => ({
      company_name: operationData.company_name,
      project_name: operationData.project_name || null,
      cif: operationData.cif || null,
      sector: operationData.sector,
      operation_type: operationData.operation_type,
      amount: operationData.amount,
      revenue: operationData.revenue || null,
      ebitda: operationData.ebitda || null,
      currency: operationData.currency,
      date: operationData.date,
      buyer: operationData.buyer || null,
      seller: operationData.seller || null,
      status: operationData.status,
      description: operationData.description || null,
      location: operationData.location || null,
      contact_email: operationData.contact_email || null,
      contact_phone: operationData.contact_phone || null,
      annual_growth_rate: operationData.annual_growth_rate || null,
      created_by: userId
    }));

    const { data, error } = await supabase
      .from('operations')
      .insert(insertDataArray)
      .select();

    if (error) {
      console.error('Error en inserción en lote:', error);
      throw error;
    }

    console.log('Operaciones creadas en lote exitosamente:', data?.length);
    return data as Operation[];
  }

  /**
   * Update an operation
   */
  static async updateOperation(operationId: string, operationData: Partial<Operation>): Promise<Operation> {
    console.log('Actualizando operación:', operationId, operationData);

    const { data, error } = await supabase
      .from('operations')
      .update(operationData)
      .eq('id', operationId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando operación:', error);
      throw error;
    }

    console.log('Operación actualizada exitosamente:', data);
    return data as Operation;
  }

  /**
   * Update operation status
   */
  static async updateOperationStatus(operationId: string, newStatus: Operation['status']): Promise<Operation> {
    console.log('Actualizando estado de operación:', operationId, 'a', newStatus);

    const { data, error } = await supabase
      .from('operations')
      .update({ status: newStatus })
      .eq('id', operationId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando estado:', error);
      throw error;
    }

    console.log('Estado actualizado exitosamente:', data);
    return data as Operation;
  }

  /**
   * Delete an operation
   */
  static async deleteOperation(operationId: string, userRole?: string): Promise<void> {
    console.log('Eliminando operación:', operationId);

    // Verificar permisos para eliminar
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      // Para usuarios regulares, verificar que son propietarios
      const { data: operation } = await supabase
        .from('operations')
        .select('created_by')
        .eq('id', operationId)
        .single();

      if (!operation) {
        throw new Error('Operación no encontrada');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (operation.created_by !== user?.id) {
        throw new Error('No tienes permisos para eliminar esta operación');
      }
    }

    const { error } = await supabase
      .from('operations')
      .delete()
      .eq('id', operationId);

    if (error) {
      console.error('Error eliminando operación:', error);
      throw error;
    }

    console.log('Operación eliminada exitosamente');
  }

  /**
   * Update teaser URL
   */
  static async updateTeaserUrl(operationId: string, teaserUrl: string | null): Promise<Operation> {
    console.log('Actualizando teaser URL:', operationId, teaserUrl);

    const { data, error } = await supabase
      .from('operations')
      .update({ teaser_url: teaserUrl })
      .eq('id', operationId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando teaser URL:', error);
      throw error;
    }

    console.log('Teaser URL actualizado exitosamente:', data);
    return data as Operation;
  }
}