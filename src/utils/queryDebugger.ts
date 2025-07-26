// Query debugger to intercept and log all Supabase requests
import { supabase } from '@/integrations/supabase/client';

// Monkey patch the supabase client to intercept all queries
const originalFrom = supabase.from.bind(supabase);

supabase.from = function(table: string) {
  console.log('🔍 QUERY INTERCEPTOR - Table:', table);
  
  const query = originalFrom(table);
  const originalSelect = query.select.bind(query);
  const originalEq = query.eq.bind(query);
  const originalOrder = query.order.bind(query);

  query.select = function(columns?: string) {
    console.log('🔍 QUERY INTERCEPTOR - SELECT:', table, columns);
    return originalSelect(columns);
  };

  query.eq = function(column: string, value: any) {
    console.log('🔍 QUERY INTERCEPTOR - EQ:', table, column, '=', value);
    return originalEq(column, value);
  };

  query.order = function(column: string, options?: any) {
    console.log('🔍 QUERY INTERCEPTOR - ORDER:', table, column, options);
    if (table === 'lead_activities' && column === 'activity_date') {
      console.error('🚨 FOUND THE BUG! - Ordering by activity_date on lead_activities table');
      console.trace('🚨 STACK TRACE:');
    }
    if (table === 'valoraciones' && options?.columns) {
      console.error('🚨 FOUND THE BUG! - Using columns parameter on valoraciones query');
      console.trace('🚨 STACK TRACE:');
    }
    return originalOrder(column, options);
  };

  return query;
};

export const enableQueryDebugging = () => {
  console.log('🔍 Query debugging enabled - All Supabase queries will be logged');
};