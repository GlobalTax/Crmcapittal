import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RODItem, RODItemType } from '@/types/RODItem';
import { Operation } from '@/types/Operation';
import { Lead } from '@/types/Lead';

export function useRODItems() {
  const [items, setItems] = useState<RODItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertOperationToRODItem = (operation: Operation): RODItem => ({
    id: operation.id,
    type: 'operation' as RODItemType,
    title: operation.project_name || operation.company_name,
    company_name: operation.company_name,
    sector: operation.sector,
    value: operation.amount,
    ebitda: operation.ebitda,
    description: operation.description,
    status: operation.status,
    highlighted: false, // Default value
    rod_order: undefined,
    created_at: operation.created_at,
    updated_at: operation.updated_at,
    operation_type: operation.operation_type,
    amount: operation.amount,
    currency: operation.currency,
    date: operation.date,
    location: operation.location,
    contact_email: operation.contact_email,
    contact_phone: operation.contact_phone,
    revenue: operation.revenue,
    annual_growth_rate: operation.annual_growth_rate,
  });

  const convertLeadToRODItem = (lead: Lead): RODItem => ({
    id: lead.id,
    type: 'lead' as RODItemType,
    title: lead.lead_name || lead.name,
    company_name: lead.company_name || 'Sin empresa',
    sector: 'Lead', // Default sector for leads
    value: lead.conversion_value,
    ebitda: undefined,
    description: lead.message,
    status: lead.status,
    highlighted: false, // Default value
    rod_order: undefined,
    created_at: lead.created_at,
    updated_at: lead.updated_at,
    lead_score: lead.lead_score,
    lead_source: lead.source,
    lead_quality: lead.quality,
    priority: lead.priority,
    email: lead.email,
    phone: lead.phone,
    job_title: lead.job_title,
    message: lead.message,
    assigned_to: lead.assigned_to,
  });

  const fetchRODItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch sale operations
      const { data: operations, error: operationsError } = await supabase
        .from('operations')
        .select('*')
        .eq('operation_type', 'sale')
        .in('status', ['available', 'pending_review', 'approved', 'in_process']);

      if (operationsError) {
        throw new Error(`Error fetching operations: ${operationsError.message}`);
      }

      // Fetch qualified leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_to:assigned_to_id (
            id,
            first_name,
            last_name
          )
        `)
        .in('status', ['QUALIFIED', 'CONTACTED']);

      if (leadsError) {
        throw new Error(`Error fetching leads: ${leadsError.message}`);
      }

      // Convert and combine data
      const operationItems = (operations || []).map((op: any) => convertOperationToRODItem(op));
      const leadItems = (leads || []).map((lead: any) => convertLeadToRODItem(lead));

      const allItems = [...operationItems, ...leadItems];

      // Sort by creation date (newest first)
      allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setItems(allItems);
    } catch (err) {
      console.error('Error fetching ROD items:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (id: string, type: RODItemType, updates: any) => {
    try {
      const table = type === 'operation' ? 'operations' : 'leads';
      
      const { error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id);

      if (error) {
        throw new Error(`Error updating ${type}: ${error.message}`);
      }

      // Refresh data
      await fetchRODItems();
    } catch (err) {
      console.error(`Error updating ${type}:`, err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRODItems();
  }, []);

  return {
    items,
    isLoading,
    error,
    refetch: fetchRODItems,
    updateItem,
  };
}