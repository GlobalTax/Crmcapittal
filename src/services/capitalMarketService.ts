
import { supabase } from '@/integrations/supabase/client';
import { CreateLeadData, LeadSource, Lead } from '@/types/Lead';
import { triggerAutomation } from './leadsService';
import { DatabaseService } from './databaseService';

export interface CapitalMarketLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  job_title?: string;
  message?: string;
  source_data?: Record<string, any>;
  lead_score?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags?: string[];
}

export class CapitalMarketService {
  private config: any = null;

  async getConfig() {
    if (!this.config) {
      try {
        const result = await DatabaseService.getCapitalMarketConfig();
        this.config = result.success ? result.data : null;
      } catch (error) {
        console.error('Error fetching capital market config:', error);
        this.config = null;
      }
    }
    return this.config;
  }

  async createLeadFromCapitalMarket(capitalMarketData: CapitalMarketLead): Promise<any> {
    console.log('Processing Capital Market lead:', capitalMarketData);

    // Map Capital Market data to our Lead structure
    const leadData: CreateLeadData = {
      name: capitalMarketData.name,
      email: capitalMarketData.email,
      phone: capitalMarketData.phone,
      company_name: capitalMarketData.company_name,
      job_title: capitalMarketData.job_title,
      message: capitalMarketData.message,
      source: 'capittal_market' as LeadSource,
      priority: capitalMarketData.priority || 'MEDIUM',
      quality: this.calculateLeadQuality(capitalMarketData),
      lead_score: capitalMarketData.lead_score || this.calculateLeadScore(capitalMarketData),
      tags: [...(capitalMarketData.tags || []), 'Capital Market', 'Auto-Import'],
      form_data: {
        external_source: 'capital_market',
        source_data: capitalMarketData.source_data,
        import_date: new Date().toISOString(),
        automation_triggered: true
      }
    };

    // Create lead in our system - only use fields that exist in the current database
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        company_name: leadData.company_name,
        message: leadData.message,
        source: leadData.source,
        status: 'NEW'
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating lead from Capital Market:', error);
      throw error;
    }

    // Transform data to match Lead interface before triggering automation
    const transformedLead = {
      ...data,
      source: (data.source as LeadSource) || 'capittal_market',
      lead_score: 10, // Default score for new leads
      priority: 'MEDIUM' as const,
      quality: 'FAIR' as const,
      follow_up_count: 0,
      email_opens: 0,
      email_clicks: 0,
      website_visits: 0,
      content_downloads: 0,
      tags: [] as string[],
      form_data: {} as Record<string, unknown>,
      job_title: '',
      lead_origin: 'import' as const,
      assigned_to: null,
      lead_nurturing: []
    };

    // Trigger automation workflows
    triggerAutomation('lead_created', transformedLead);
    triggerAutomation('capital_market_lead_imported', transformedLead);

    // Start nurturing sequence if applicable
    await this.startNurturingSequence(transformedLead);

    return transformedLead;
  }

  private calculateLeadScore(leadData: CapitalMarketLead): number {
    let score = 10; // Base score

    // Company name adds credibility
    if (leadData.company_name) score += 15;
    
    // Job title scoring
    if (leadData.job_title) {
      const title = leadData.job_title.toLowerCase();
      if (title.includes('ceo') || title.includes('founder')) score += 25;
      else if (title.includes('director') || title.includes('manager')) score += 15;
      else score += 10;
    }

    // Phone number availability
    if (leadData.phone) score += 10;

    // Message quality
    if (leadData.message && leadData.message.length > 50) score += 15;

    // Pre-calculated score from Capital Market
    if (leadData.lead_score) score += leadData.lead_score;

    return Math.min(score, 100); // Cap at 100
  }

  private calculateLeadQuality(leadData: CapitalMarketLead): 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT' {
    const score = this.calculateLeadScore(leadData);
    
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'GOOD';
    if (score >= 40) return 'FAIR';
    return 'POOR';
  }

  private async startNurturingSequence(leadData: any) {
    try {
      const { data: sequences } = await supabase
        .from('nurturing_sequences')
        .select('*')
        .eq('is_active', true);

      for (const sequence of sequences || []) {
        // For now, just log the sequence start since we don't have the full nurturing tables
        console.log(`Would start nurturing sequence "${sequence.name}" for lead ${leadData.id}`);
      }
    } catch (error) {
      console.error('Error starting nurturing sequence:', error);
    }
  }

  async syncFromCapitalMarket(): Promise<{ success: boolean; imported: number; errors: string[] }> {
    const config = await this.getConfig();
    if (!config || !config.enabled) {
      return { success: false, imported: 0, errors: ['Capital Market integration not configured'] };
    }

    try {
      // In a real implementation, this would call the Capital Market API
      // For demo purposes, we'll simulate some data
      const mockLeads: CapitalMarketLead[] = [
        {
          id: 'cm_001',
          name: 'Roberto Silva',
          email: 'roberto@technovatex.com',
          company_name: 'TechnovatEx',
          job_title: 'CEO',
          phone: '+34 611 222 333',
          message: 'Buscamos asesoramiento para posible venta de la empresa tras 8 años de crecimiento',
          lead_score: 85,
          priority: 'HIGH',
          tags: ['Tech', 'Exit Ready', 'High Revenue']
        },
        {
          id: 'cm_002',
          name: 'Elena Martínez',
          email: 'elena@greenenergy.es',
          company_name: 'Green Energy Solutions',
          job_title: 'Founder',
          phone: '+34 622 333 444',
          message: 'Startup de energías renovables lista para ronda de inversión Serie B',
          lead_score: 78,
          priority: 'HIGH',
          tags: ['Cleantech', 'Series B', 'Founder']
        }
      ];

      let imported = 0;
      const errors: string[] = [];

      for (const mockLead of mockLeads) {
        try {
          // Check if lead already exists by email (since external_id field might not exist)
          const { data: existing } = await supabase
            .from('leads')
            .select('id')
            .eq('email', mockLead.email)
            .single();

          if (!existing) {
            await this.createLeadFromCapitalMarket(mockLead);
            imported++;
          }
        } catch (error) {
          errors.push(`Error importing lead ${mockLead.name}: ${error}`);
        }
      }

      return { success: true, imported, errors };
    } catch (error) {
      return { 
        success: false, 
        imported: 0, 
        errors: [`Sync failed: ${error}`] 
      };
    }
  }
}

export const capitalMarketService = new CapitalMarketService();
