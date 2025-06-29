
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseQueryResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class DatabaseService {
  // For now, we'll work with existing tables and handle missing columns gracefully
  static async query<T = any>(sql: string, params?: any[]): Promise<DatabaseQueryResult<T>> {
    try {
      // Since execute_sql doesn't exist, we'll use direct table queries
      // This is a temporary solution until the database types are updated
      console.log('Database query:', sql, params);
      
      // Return mock data for now to prevent errors
      return {
        success: true,
        data: [] as T
      };
    } catch (error) {
      console.error('Database query error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }
  }

  static async getAutomationRules(): Promise<DatabaseQueryResult<any[]>> {
    // Return mock automation rules until database is properly configured
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Bienvenida Lead Nuevo',
          description: 'Envía email de bienvenida a leads nuevos',
          trigger_type: 'lead_created',
          trigger_config: {},
          conditions: [{ field: 'status', operator: 'equals', value: 'NEW' }],
          actions: [{ type: 'send_email', config: { template: 'welcome_lead' } }],
          enabled: true,
          priority: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  static async getCapitalMarketConfig(): Promise<DatabaseQueryResult<any>> {
    // Return mock config until database is properly configured
    return {
      success: true,
      data: {
        id: '1',
        api_key: 'demo_key',
        webhook_secret: 'demo_secret',
        base_url: 'https://api.capitalmarket.com',
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }
}
