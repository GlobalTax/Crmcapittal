export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_configurations: {
        Row: {
          api_name: string
          base_url: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          api_name: string
          base_url: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          api_name?: string
          base_url?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_trail: {
        Row: {
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          operation: string
          session_id: string | null
          table_name: string
          timestamp: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          session_id?: string | null
          table_name: string
          timestamp?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          session_id?: string | null
          table_name?: string
          timestamp?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      buying_mandates: {
        Row: {
          assigned_user_id: string | null
          client_contact: string
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          mandate_name: string
          mandate_type: string
          max_ebitda: number | null
          max_revenue: number | null
          min_ebitda: number | null
          min_revenue: number | null
          other_criteria: string | null
          start_date: string
          status: string
          target_locations: string[] | null
          target_sectors: string[]
          updated_at: string
        }
        Insert: {
          assigned_user_id?: string | null
          client_contact: string
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          mandate_name: string
          mandate_type?: string
          max_ebitda?: number | null
          max_revenue?: number | null
          min_ebitda?: number | null
          min_revenue?: number | null
          other_criteria?: string | null
          start_date?: string
          status?: string
          target_locations?: string[] | null
          target_sectors?: string[]
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          client_contact?: string
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          mandate_name?: string
          mandate_type?: string
          max_ebitda?: number | null
          max_revenue?: number | null
          min_ebitda?: number | null
          min_revenue?: number | null
          other_criteria?: string | null
          start_date?: string
          status?: string
          target_locations?: string[] | null
          target_sectors?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          audience: string
          created_at: string
          created_by: string | null
          html_body: string
          id: string
          opportunity_ids: string[]
          sent_at: string
          subject: string
        }
        Insert: {
          audience?: string
          created_at?: string
          created_by?: string | null
          html_body: string
          id?: string
          opportunity_ids?: string[]
          sent_at?: string
          subject: string
        }
        Update: {
          audience?: string
          created_at?: string
          created_by?: string | null
          html_body?: string
          id?: string
          opportunity_ids?: string[]
          sent_at?: string
          subject?: string
        }
        Relationships: []
      }
      cases: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          case_number: string
          company_id: string | null
          contact_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          estimated_hours: number | null
          id: string
          practice_area_id: string
          priority: string | null
          proposal_id: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          case_number: string
          company_id?: string | null
          contact_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          practice_area_id: string
          priority?: string | null
          proposal_id?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          case_number?: string
          company_id?: string | null
          contact_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          practice_area_id?: string
          priority?: string | null
          proposal_id?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_practice_area_id_fkey"
            columns: ["practice_area_id"]
            isOneToOne: false
            referencedRelation: "practice_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          company_id_origen: number | null
          datos_completos: Json | null
          email: string | null
          nif: string | null
          nombre: string | null
          regid: number
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          company_id_origen?: number | null
          datos_completos?: Json | null
          email?: string | null
          nif?: string | null
          nombre?: string | null
          regid: number
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id_origen?: number | null
          datos_completos?: Json | null
          email?: string | null
          nif?: string | null
          nombre?: string | null
          regid?: number
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      collaborators: {
        Row: {
          agreement_date: string | null
          agreement_id: string | null
          agreement_signed_date: string | null
          agreement_status: string | null
          base_commission: number | null
          collaborator_type: Database["public"]["Enums"]["collaborator_type"]
          commission_percentage: number | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agreement_date?: string | null
          agreement_id?: string | null
          agreement_signed_date?: string | null
          agreement_status?: string | null
          base_commission?: number | null
          collaborator_type?: Database["public"]["Enums"]["collaborator_type"]
          commission_percentage?: number | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agreement_date?: string | null
          agreement_id?: string | null
          agreement_signed_date?: string | null
          agreement_status?: string | null
          base_commission?: number | null
          collaborator_type?: Database["public"]["Enums"]["collaborator_type"]
          commission_percentage?: number | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborators_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_approvals: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string
          commission_id: string
          id: string
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by: string
          commission_id: string
          id?: string
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string
          commission_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_approvals_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_payments: {
        Row: {
          commission_id: string
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          payment_amount: number
          payment_date: string
          payment_method: string | null
          payment_reference: string | null
        }
        Insert: {
          commission_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_amount: number
          payment_date: string
          payment_method?: string | null
          payment_reference?: string | null
        }
        Update: {
          commission_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_amount?: number
          payment_date?: string
          payment_method?: string | null
          payment_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_payments_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          base_commission: number
          collaborator_id: string | null
          collaborator_type:
            | Database["public"]["Enums"]["collaborator_type"]
            | null
          commission_percentage: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          max_amount: number | null
          min_amount: number | null
          name: string
          source_type: string
          updated_at: string | null
        }
        Insert: {
          base_commission?: number
          collaborator_id?: string | null
          collaborator_type?:
            | Database["public"]["Enums"]["collaborator_type"]
            | null
          commission_percentage?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name: string
          source_type: string
          updated_at?: string | null
        }
        Update: {
          base_commission?: number
          collaborator_id?: string | null
          collaborator_type?:
            | Database["public"]["Enums"]["collaborator_type"]
            | null
          commission_percentage?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          name?: string
          source_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      commissions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          calculation_details: Json | null
          collaborator_id: string | null
          commission_amount: number
          commission_percentage: number | null
          created_at: string
          deal_id: string | null
          employee_id: string | null
          id: string
          lead_id: string | null
          notes: string | null
          paid_at: string | null
          payment_due_date: string | null
          recipient_name: string | null
          recipient_type: Database["public"]["Enums"]["recipient_type"]
          source_name: string | null
          source_type: string | null
          status: Database["public"]["Enums"]["commission_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          calculation_details?: Json | null
          collaborator_id?: string | null
          commission_amount: number
          commission_percentage?: number | null
          created_at?: string
          deal_id?: string | null
          employee_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_due_date?: string | null
          recipient_name?: string | null
          recipient_type?: Database["public"]["Enums"]["recipient_type"]
          source_name?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          calculation_details?: Json | null
          collaborator_id?: string | null
          commission_amount?: number
          commission_percentage?: number | null
          created_at?: string
          deal_id?: string | null
          employee_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_due_date?: string | null
          recipient_name?: string | null
          recipient_type?: Database["public"]["Enums"]["recipient_type"]
          source_name?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborator_commissions_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborator_commissions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborator_commissions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "hubspot_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborator_commissions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "hubspot_deals_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborator_commissions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string | null
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject?: string | null
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string | null
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          annual_revenue: number | null
          business_segment:
            | Database["public"]["Enums"]["business_segment"]
            | null
          city: string | null
          company_size: Database["public"]["Enums"]["company_size"]
          company_status: Database["public"]["Enums"]["company_status"]
          company_type: Database["public"]["Enums"]["company_type"]
          country: string | null
          created_at: string
          created_by: string | null
          deal_readiness_score: number | null
          description: string | null
          domain: string | null
          engagement_level: number | null
          engagement_score: number | null
          external_id: string | null
          facebook_url: string | null
          first_contact_date: string | null
          founded_year: number | null
          geographic_scope:
            | Database["public"]["Enums"]["geographic_scope"]
            | null
          id: string
          industry: string | null
          is_franquicia: boolean
          is_key_account: boolean
          is_target_account: boolean
          last_activity_date: string | null
          last_contact_date: string | null
          lead_score: number | null
          lifecycle_stage: Database["public"]["Enums"]["lifecycle_stage"]
          linkedin_url: string | null
          name: string
          network_strength: number | null
          next_follow_up_date: string | null
          nif: string | null
          notes: string | null
          owner_id: string | null
          owner_name: string | null
          phone: string | null
          postal_code: string | null
          source_table: string | null
          state: string | null
          tags: string[] | null
          transaction_interest:
            | Database["public"]["Enums"]["transaction_interest"]
            | null
          twitter_url: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          annual_revenue?: number | null
          business_segment?:
            | Database["public"]["Enums"]["business_segment"]
            | null
          city?: string | null
          company_size?: Database["public"]["Enums"]["company_size"]
          company_status?: Database["public"]["Enums"]["company_status"]
          company_type?: Database["public"]["Enums"]["company_type"]
          country?: string | null
          created_at?: string
          created_by?: string | null
          deal_readiness_score?: number | null
          description?: string | null
          domain?: string | null
          engagement_level?: number | null
          engagement_score?: number | null
          external_id?: string | null
          facebook_url?: string | null
          first_contact_date?: string | null
          founded_year?: number | null
          geographic_scope?:
            | Database["public"]["Enums"]["geographic_scope"]
            | null
          id?: string
          industry?: string | null
          is_franquicia?: boolean
          is_key_account?: boolean
          is_target_account?: boolean
          last_activity_date?: string | null
          last_contact_date?: string | null
          lead_score?: number | null
          lifecycle_stage?: Database["public"]["Enums"]["lifecycle_stage"]
          linkedin_url?: string | null
          name: string
          network_strength?: number | null
          next_follow_up_date?: string | null
          nif?: string | null
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          phone?: string | null
          postal_code?: string | null
          source_table?: string | null
          state?: string | null
          tags?: string[] | null
          transaction_interest?:
            | Database["public"]["Enums"]["transaction_interest"]
            | null
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          annual_revenue?: number | null
          business_segment?:
            | Database["public"]["Enums"]["business_segment"]
            | null
          city?: string | null
          company_size?: Database["public"]["Enums"]["company_size"]
          company_status?: Database["public"]["Enums"]["company_status"]
          company_type?: Database["public"]["Enums"]["company_type"]
          country?: string | null
          created_at?: string
          created_by?: string | null
          deal_readiness_score?: number | null
          description?: string | null
          domain?: string | null
          engagement_level?: number | null
          engagement_score?: number | null
          external_id?: string | null
          facebook_url?: string | null
          first_contact_date?: string | null
          founded_year?: number | null
          geographic_scope?:
            | Database["public"]["Enums"]["geographic_scope"]
            | null
          id?: string
          industry?: string | null
          is_franquicia?: boolean
          is_key_account?: boolean
          is_target_account?: boolean
          last_activity_date?: string | null
          last_contact_date?: string | null
          lead_score?: number | null
          lifecycle_stage?: Database["public"]["Enums"]["lifecycle_stage"]
          linkedin_url?: string | null
          name?: string
          network_strength?: number | null
          next_follow_up_date?: string | null
          nif?: string | null
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          phone?: string | null
          postal_code?: string | null
          source_table?: string | null
          state?: string | null
          tags?: string[] | null
          transaction_interest?:
            | Database["public"]["Enums"]["transaction_interest"]
            | null
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_enrichments: {
        Row: {
          company_id: string
          confidence_score: number | null
          created_at: string
          enrichment_data: Json
          enrichment_date: string
          id: string
          source: string
          updated_at: string
        }
        Insert: {
          company_id: string
          confidence_score?: number | null
          created_at?: string
          enrichment_data: Json
          enrichment_date?: string
          id?: string
          source?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          confidence_score?: number | null
          created_at?: string
          enrichment_data?: Json
          enrichment_date?: string
          id?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_files: {
        Row: {
          company_id: string
          content_type: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          content_type?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          content_type?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      company_mandates: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          mandate_id: string
          notes: string | null
          relationship_type: Database["public"]["Enums"]["mandate_relationship_type"]
          status: Database["public"]["Enums"]["mandate_relationship_status"]
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          mandate_id: string
          notes?: string | null
          relationship_type: Database["public"]["Enums"]["mandate_relationship_type"]
          status?: Database["public"]["Enums"]["mandate_relationship_status"]
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          mandate_id?: string
          notes?: string | null
          relationship_type?: Database["public"]["Enums"]["mandate_relationship_type"]
          status?: Database["public"]["Enums"]["mandate_relationship_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_mandates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_mandates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_mandates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_mandates_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
            referencedColumns: ["id"]
          },
        ]
      }
      company_notes: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          note: string
          note_type: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note: string
          note_type?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string
          note_type?: string | null
        }
        Relationships: []
      }
      connected_accounts: {
        Row: {
          access_token: string | null
          created_at: string
          email: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          last_sync_at: string | null
          name: string | null
          provider: string
          provider_account_id: string | null
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          name?: string | null
          provider: string
          provider_account_id?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          name?: string | null
          provider?: string
          provider_account_id?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          contact_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          contact_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          contact_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_companies: {
        Row: {
          company_description: string | null
          company_linkedin: string | null
          company_location: string | null
          company_name: string
          company_revenue: number | null
          company_sector: string | null
          company_size: string | null
          company_website: string | null
          contact_id: string
          created_at: string
          founded_year: number | null
          id: string
          is_primary: boolean | null
          updated_at: string
        }
        Insert: {
          company_description?: string | null
          company_linkedin?: string | null
          company_location?: string | null
          company_name: string
          company_revenue?: number | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          contact_id: string
          created_at?: string
          founded_year?: number | null
          id?: string
          is_primary?: boolean | null
          updated_at?: string
        }
        Update: {
          company_description?: string | null
          company_linkedin?: string | null
          company_location?: string | null
          company_name?: string
          company_revenue?: number | null
          company_sector?: string | null
          company_size?: string | null
          company_website?: string | null
          contact_id?: string
          created_at?: string
          founded_year?: number | null
          id?: string
          is_primary?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_companies_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_companies_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_companies_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_files: {
        Row: {
          contact_id: string
          content_type: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          contact_id: string
          content_type?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          contact_id?: string
          content_type?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_files_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_files_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_files_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_history: {
        Row: {
          created_at: string
          created_by: string | null
          fecha_contacto: string
          id: string
          mandate_id: string
          medio: string
          resultado: string
          target_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          fecha_contacto?: string
          id?: string
          mandate_id: string
          medio: string
          resultado?: string
          target_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          fecha_contacto?: string
          id?: string
          mandate_id?: string
          medio?: string
          resultado?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_interactions: {
        Row: {
          attendees: Json | null
          contact_id: string
          created_at: string
          created_by: string | null
          description: string | null
          documents_shared: string[] | null
          duration_minutes: number | null
          id: string
          interaction_date: string | null
          interaction_method: string | null
          interaction_type: string
          lead_id: string | null
          location: string | null
          next_action: string | null
          next_action_date: string | null
          outcome: string | null
          subject: string | null
        }
        Insert: {
          attendees?: Json | null
          contact_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          documents_shared?: string[] | null
          duration_minutes?: number | null
          id?: string
          interaction_date?: string | null
          interaction_method?: string | null
          interaction_type: string
          lead_id?: string | null
          location?: string | null
          next_action?: string | null
          next_action_date?: string | null
          outcome?: string | null
          subject?: string | null
        }
        Update: {
          attendees?: Json | null
          contact_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          documents_shared?: string[] | null
          duration_minutes?: number | null
          id?: string
          interaction_date?: string | null
          interaction_method?: string | null
          interaction_type?: string
          lead_id?: string | null
          location?: string | null
          next_action?: string | null
          next_action_date?: string | null
          outcome?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_notes: {
        Row: {
          contact_id: string
          created_at: string
          created_by: string | null
          id: string
          note: string
          note_type: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note: string
          note_type?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string
          note_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_operations: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          operation_id: string
          relationship_type: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          operation_id: string
          relationship_type?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          operation_id?: string
          relationship_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_operations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_operations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_operations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_operations_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_reminders: {
        Row: {
          completed_at: string | null
          contact_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_completed: boolean | null
          priority: string | null
          reminder_date: string
          reminder_type: string | null
          title: string
        }
        Insert: {
          completed_at?: string | null
          contact_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          reminder_date: string
          reminder_type?: string | null
          title: string
        }
        Update: {
          completed_at?: string | null
          contact_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          reminder_date?: string
          reminder_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_reminders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_reminders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_reminders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tag_relations: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tag_relations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tag_relations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tag_relations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "contact_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      contact_tasks: {
        Row: {
          assigned_to: string | null
          completed: boolean | null
          contact_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean | null
          contact_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean | null
          contact_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_views: {
        Row: {
          columns: Json
          created_at: string
          description: string | null
          filters: Json
          id: string
          is_default: boolean | null
          is_shared: boolean | null
          name: string
          sort_by: string | null
          sort_order: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          columns?: Json
          created_at?: string
          description?: string | null
          filters?: Json
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          name: string
          sort_by?: string | null
          sort_order?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          columns?: Json
          created_at?: string
          description?: string | null
          filters?: Json
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          name?: string
          sort_by?: string | null
          sort_order?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          assigned_to_id: string | null
          collaborator_id: string | null
          company: string | null
          company_id: string | null
          contact_priority: string | null
          contact_roles: Database["public"]["Enums"]["contact_role"][] | null
          contact_source: string | null
          contact_status: Database["public"]["Enums"]["contact_status"] | null
          contact_type: string
          content_downloads: number | null
          conversion_date: string | null
          conversion_value: number | null
          converted_to_mandate_id: string | null
          created_at: string
          created_by: string | null
          deal_preferences: Json | null
          ecosystem_role: Database["public"]["Enums"]["ecosystem_role"] | null
          email: string | null
          email_clicks: number | null
          email_opens: number | null
          engagement_level: number | null
          external_id: string | null
          external_lead_id: string | null
          external_source: string | null
          first_contact_date: string | null
          follow_up_count: number | null
          id: string
          investment_capacity_max: number | null
          investment_capacity_min: number | null
          is_active: boolean | null
          language_preference: string | null
          last_activity_date: string | null
          last_contact_date: string | null
          last_interaction_date: string | null
          lead_origin: string | null
          lead_priority: string | null
          lead_quality: string | null
          lead_score: number | null
          lead_source: string | null
          lead_status: string | null
          lead_type: string | null
          lifecycle_stage: string | null
          linkedin_url: string | null
          name: string
          network_connections: number | null
          next_follow_up_date: string | null
          notes: string | null
          phone: string | null
          position: string | null
          preferred_contact_method: string | null
          roles: string[] | null
          sectors_of_interest: string[] | null
          source_table: string | null
          stage_id: string | null
          tags_array: string[] | null
          time_zone: string | null
          updated_at: string
          website_url: string | null
          website_visits: number | null
        }
        Insert: {
          assigned_to_id?: string | null
          collaborator_id?: string | null
          company?: string | null
          company_id?: string | null
          contact_priority?: string | null
          contact_roles?: Database["public"]["Enums"]["contact_role"][] | null
          contact_source?: string | null
          contact_status?: Database["public"]["Enums"]["contact_status"] | null
          contact_type?: string
          content_downloads?: number | null
          conversion_date?: string | null
          conversion_value?: number | null
          converted_to_mandate_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_preferences?: Json | null
          ecosystem_role?: Database["public"]["Enums"]["ecosystem_role"] | null
          email?: string | null
          email_clicks?: number | null
          email_opens?: number | null
          engagement_level?: number | null
          external_id?: string | null
          external_lead_id?: string | null
          external_source?: string | null
          first_contact_date?: string | null
          follow_up_count?: number | null
          id?: string
          investment_capacity_max?: number | null
          investment_capacity_min?: number | null
          is_active?: boolean | null
          language_preference?: string | null
          last_activity_date?: string | null
          last_contact_date?: string | null
          last_interaction_date?: string | null
          lead_origin?: string | null
          lead_priority?: string | null
          lead_quality?: string | null
          lead_score?: number | null
          lead_source?: string | null
          lead_status?: string | null
          lead_type?: string | null
          lifecycle_stage?: string | null
          linkedin_url?: string | null
          name: string
          network_connections?: number | null
          next_follow_up_date?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          preferred_contact_method?: string | null
          roles?: string[] | null
          sectors_of_interest?: string[] | null
          source_table?: string | null
          stage_id?: string | null
          tags_array?: string[] | null
          time_zone?: string | null
          updated_at?: string
          website_url?: string | null
          website_visits?: number | null
        }
        Update: {
          assigned_to_id?: string | null
          collaborator_id?: string | null
          company?: string | null
          company_id?: string | null
          contact_priority?: string | null
          contact_roles?: Database["public"]["Enums"]["contact_role"][] | null
          contact_source?: string | null
          contact_status?: Database["public"]["Enums"]["contact_status"] | null
          contact_type?: string
          content_downloads?: number | null
          conversion_date?: string | null
          conversion_value?: number | null
          converted_to_mandate_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_preferences?: Json | null
          ecosystem_role?: Database["public"]["Enums"]["ecosystem_role"] | null
          email?: string | null
          email_clicks?: number | null
          email_opens?: number | null
          engagement_level?: number | null
          external_id?: string | null
          external_lead_id?: string | null
          external_source?: string | null
          first_contact_date?: string | null
          follow_up_count?: number | null
          id?: string
          investment_capacity_max?: number | null
          investment_capacity_min?: number | null
          is_active?: boolean | null
          language_preference?: string | null
          last_activity_date?: string | null
          last_contact_date?: string | null
          last_interaction_date?: string | null
          lead_origin?: string | null
          lead_priority?: string | null
          lead_quality?: string | null
          lead_score?: number | null
          lead_source?: string | null
          lead_status?: string | null
          lead_type?: string | null
          lifecycle_stage?: string | null
          linkedin_url?: string | null
          name?: string
          network_connections?: number | null
          next_follow_up_date?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          preferred_contact_method?: string | null
          roles?: string[] | null
          sectors_of_interest?: string[] | null
          source_table?: string | null
          stage_id?: string | null
          tags_array?: string[] | null
          time_zone?: string | null
          updated_at?: string
          website_url?: string | null
          website_visits?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      cuentas: {
        Row: {
          balance_actual: number | null
          credito: number | null
          datos_completos: Json | null
          debito: number | null
          id: string
          nombre: string | null
          updated_at: string | null
        }
        Insert: {
          balance_actual?: number | null
          credito?: number | null
          datos_completos?: Json | null
          debito?: number | null
          id: string
          nombre?: string | null
          updated_at?: string | null
        }
        Update: {
          balance_actual?: number | null
          credito?: number | null
          datos_completos?: Json | null
          debito?: number | null
          id?: string
          nombre?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          account: string | null
          address: string | null
          city: string | null
          company_id: string | null
          contact: string | null
          country: string | null
          country_id: string | null
          created_at: string
          customer_id: string
          discount: number | null
          email: string | null
          id: number
          name: string | null
          nif: string | null
          observations: string | null
          origin_id: string | null
          pay_document_description: string | null
          phone: string | null
          postal_code: string | null
          province: string | null
          reason: string | null
          retention: number | null
          sell_account_description: string | null
          way_to_pay_description: string | null
        }
        Insert: {
          account?: string | null
          address?: string | null
          city?: string | null
          company_id?: string | null
          contact?: string | null
          country?: string | null
          country_id?: string | null
          created_at?: string
          customer_id: string
          discount?: number | null
          email?: string | null
          id?: number
          name?: string | null
          nif?: string | null
          observations?: string | null
          origin_id?: string | null
          pay_document_description?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          reason?: string | null
          retention?: number | null
          sell_account_description?: string | null
          way_to_pay_description?: string | null
        }
        Update: {
          account?: string | null
          address?: string | null
          city?: string | null
          company_id?: string | null
          contact?: string | null
          country?: string | null
          country_id?: string | null
          created_at?: string
          customer_id?: string
          discount?: number | null
          email?: string | null
          id?: number
          name?: string | null
          nif?: string | null
          observations?: string | null
          origin_id?: string | null
          pay_document_description?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          reason?: string | null
          retention?: number | null
          sell_account_description?: string | null
          way_to_pay_description?: string | null
        }
        Relationships: []
      }
      deal_documents: {
        Row: {
          content_type: string | null
          created_at: string
          deal_id: string
          document_category: string
          document_status: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          notes: string | null
          order_position: number | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          deal_id: string
          document_category?: string
          document_status?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          notes?: string | null
          order_position?: number | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          deal_id?: string
          document_category?: string
          document_status?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          notes?: string | null
          order_position?: number | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          close_date: string | null
          company_name: string | null
          contact_email: string | null
          contact_id: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_role: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          deal_name: string
          deal_owner: string | null
          deal_type: string
          deal_value: number | null
          description: string | null
          ebitda: number | null
          employees: number | null
          external_id: string | null
          id: string
          is_active: boolean
          lead_source: string | null
          location: string | null
          multiplier: number | null
          next_activity: string | null
          notes: string | null
          priority: string | null
          revenue: number | null
          sector: string | null
          source_table: string | null
          stage_id: string | null
          updated_at: string
        }
        Insert: {
          close_date?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_id?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_role?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deal_name: string
          deal_owner?: string | null
          deal_type?: string
          deal_value?: number | null
          description?: string | null
          ebitda?: number | null
          employees?: number | null
          external_id?: string | null
          id?: string
          is_active?: boolean
          lead_source?: string | null
          location?: string | null
          multiplier?: number | null
          next_activity?: string | null
          notes?: string | null
          priority?: string | null
          revenue?: number | null
          sector?: string | null
          source_table?: string | null
          stage_id?: string | null
          updated_at?: string
        }
        Update: {
          close_date?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_id?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_role?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deal_name?: string
          deal_owner?: string | null
          deal_type?: string
          deal_value?: number | null
          description?: string | null
          ebitda?: number | null
          employees?: number | null
          external_id?: string | null
          id?: string
          is_active?: boolean
          lead_source?: string | null
          location?: string | null
          multiplier?: number | null
          next_activity?: string | null
          notes?: string | null
          priority?: string | null
          revenue?: number | null
          sector?: string | null
          source_table?: string | null
          stage_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      document_access_logs: {
        Row: {
          access_type: string
          accessed_at: string
          contact_id: string | null
          document_id: string
          document_type: string
          id: string
          ip_address: unknown | null
          session_duration: number | null
          user_agent: string | null
        }
        Insert: {
          access_type?: string
          accessed_at?: string
          contact_id?: string | null
          document_id: string
          document_type: string
          id?: string
          ip_address?: unknown | null
          session_duration?: number | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          contact_id?: string | null
          document_id?: string
          document_type?: string
          id?: string
          ip_address?: unknown | null
          session_duration?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          document_type: string
          id: string
          metadata: Json | null
          published_at: string | null
          status: string
          template_id: string | null
          title: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by?: string | null
          document_type?: string
          id?: string
          metadata?: Json | null
          published_at?: string | null
          status?: string
          template_id?: string | null
          title: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          document_type?: string
          id?: string
          metadata?: Json | null
          published_at?: string | null
          status?: string
          template_id?: string | null
          title?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      embeddings: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: string
          object_id: string | null
          object_type: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          object_id?: string | null
          object_type?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          object_id?: string | null
          object_type?: string | null
        }
        Relationships: []
      }
      empresas: {
        Row: {
          codigo_interno: number | null
          datos_completos: Json | null
          id: number
          nif: string | null
          nombre: string | null
          updated_at: string | null
        }
        Insert: {
          codigo_interno?: number | null
          datos_completos?: Json | null
          id: number
          nif?: string | null
          nombre?: string | null
          updated_at?: string | null
        }
        Update: {
          codigo_interno?: number | null
          datos_completos?: Json | null
          id?: number
          nif?: string | null
          nombre?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      empresas_integraloop: {
        Row: {
          cif: string | null
          codigo_postal: string | null
          companyId: string
          datos_completos: Json | null
          direccion: string | null
          email: string | null
          nombre: string | null
          poblacion: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          cif?: string | null
          codigo_postal?: string | null
          companyId: string
          datos_completos?: Json | null
          direccion?: string | null
          email?: string | null
          nombre?: string | null
          poblacion?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          cif?: string | null
          codigo_postal?: string | null
          companyId?: string
          datos_completos?: Json | null
          direccion?: string | null
          email?: string | null
          nombre?: string | null
          poblacion?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fee_history: {
        Row: {
          amount: number
          billing_period_end: string
          billing_period_start: string
          created_at: string
          currency: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          notes: string | null
          payment_date: string | null
          recurring_fee_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          currency?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          payment_date?: string | null
          recurring_fee_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          currency?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          payment_date?: string | null
          recurring_fee_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_history_recurring_fee_id_fkey"
            columns: ["recurring_fee_id"]
            isOneToOne: false
            referencedRelation: "recurring_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      field_visibility_config: {
        Row: {
          created_at: string | null
          field_name: string
          id: string
          is_editable: boolean | null
          is_visible: boolean | null
          mask_type: string | null
          role: Database["public"]["Enums"]["app_role"]
          table_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          field_name: string
          id?: string
          is_editable?: boolean | null
          is_visible?: boolean | null
          mask_type?: string | null
          role: Database["public"]["Enums"]["app_role"]
          table_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          field_name?: string
          id?: string
          is_editable?: boolean | null
          is_visible?: boolean | null
          mask_type?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          table_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      impuestos: {
        Row: {
          company_id_origen: number | null
          csv: string | null
          ejercicio: number | null
          id: number
          importe: number | null
          modelo: string | null
          periodo: string | null
          presentado: boolean | null
          updated_at: string | null
        }
        Insert: {
          company_id_origen?: number | null
          csv?: string | null
          ejercicio?: number | null
          id?: number
          importe?: number | null
          modelo?: string | null
          periodo?: string | null
          presentado?: boolean | null
          updated_at?: string | null
        }
        Update: {
          company_id_origen?: number | null
          csv?: string | null
          ejercicio?: number | null
          id?: number
          importe?: number | null
          modelo?: string | null
          periodo?: string | null
          presentado?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      info_memos: {
        Row: {
          attachments: Json | null
          company_overview: string | null
          created_at: string
          created_by: string | null
          document_url: string | null
          executive_summary: string | null
          financial_information: Json | null
          growth_opportunities: string | null
          id: string
          management_team: Json | null
          market_analysis: string | null
          published_at: string | null
          risk_factors: string | null
          status: string
          title: string
          transaction_id: string
          updated_at: string
          version: number | null
        }
        Insert: {
          attachments?: Json | null
          company_overview?: string | null
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          executive_summary?: string | null
          financial_information?: Json | null
          growth_opportunities?: string | null
          id?: string
          management_team?: Json | null
          market_analysis?: string | null
          published_at?: string | null
          risk_factors?: string | null
          status?: string
          title: string
          transaction_id: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          attachments?: Json | null
          company_overview?: string | null
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          executive_summary?: string | null
          financial_information?: Json | null
          growth_opportunities?: string | null
          id?: string
          management_team?: Json | null
          market_analysis?: string | null
          published_at?: string | null
          risk_factors?: string | null
          status?: string
          title?: string
          transaction_id?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          activity_data: Json | null
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          points_awarded: number
        }
        Insert: {
          activity_data?: Json | null
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          points_awarded?: number
        }
        Update: {
          activity_data?: Json | null
          activity_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          points_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_analytics: {
        Row: {
          calculation_date: string
          created_at: string
          id: string
          lead_id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
        }
        Insert: {
          calculation_date?: string
          created_at?: string
          id?: string
          lead_id: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
        }
        Update: {
          calculation_date?: string
          created_at?: string
          id?: string
          lead_id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_analytics_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_assignment_rules: {
        Row: {
          assigned_user_id: string | null
          assignment_type: string
          conditions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          priority: number
          updated_at: string
        }
        Insert: {
          assigned_user_id?: string | null
          assignment_type?: string
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          priority?: number
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          assignment_type?: string
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          updated_at?: string
        }
        Relationships: []
      }
      lead_files: {
        Row: {
          content_type: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          lead_id: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          lead_id: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          lead_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_files_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_interactions: {
        Row: {
          created_at: string
          detalle: string | null
          fecha: string
          id: string
          lead_id: string
          tipo: Database["public"]["Enums"]["interaction_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          detalle?: string | null
          fecha?: string
          id?: string
          lead_id: string
          tipo: Database["public"]["Enums"]["interaction_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          detalle?: string | null
          fecha?: string
          id?: string
          lead_id?: string
          tipo?: Database["public"]["Enums"]["interaction_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          lead_id: string
          note: string
          note_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id: string
          note: string
          note_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          lead_id?: string
          note?: string
          note_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_nurturing: {
        Row: {
          assigned_to_id: string | null
          created_at: string
          engagement_score: number
          id: string
          last_activity_date: string | null
          lead_id: string
          lead_score: number
          next_action_date: string | null
          nurturing_status: Database["public"]["Enums"]["nurturing_status"]
          qualification_criteria: Json | null
          source_details: Json | null
          stage: Database["public"]["Enums"]["lead_stage"]
          updated_at: string
        }
        Insert: {
          assigned_to_id?: string | null
          created_at?: string
          engagement_score?: number
          id?: string
          last_activity_date?: string | null
          lead_id: string
          lead_score?: number
          next_action_date?: string | null
          nurturing_status?: Database["public"]["Enums"]["nurturing_status"]
          qualification_criteria?: Json | null
          source_details?: Json | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
        }
        Update: {
          assigned_to_id?: string | null
          created_at?: string
          engagement_score?: number
          id?: string
          last_activity_date?: string | null
          lead_id?: string
          lead_score?: number
          next_action_date?: string | null
          nurturing_status?: Database["public"]["Enums"]["nurturing_status"]
          qualification_criteria?: Json | null
          source_details?: Json | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_nurturing_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_score_logs: {
        Row: {
          delta: number
          fecha: string
          id: string
          lead_id: string
          regla: string
          total: number
        }
        Insert: {
          delta: number
          fecha?: string
          id?: string
          lead_id: string
          regla: string
          total: number
        }
        Update: {
          delta?: number
          fecha?: string
          id?: string
          lead_id?: string
          regla?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_score_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scoring_rules: {
        Row: {
          activo: boolean
          condicion: Json
          created_at: string
          description: string | null
          id: string
          nombre: string
          valor: number
        }
        Insert: {
          activo?: boolean
          condicion: Json
          created_at?: string
          description?: string | null
          id?: string
          nombre: string
          valor: number
        }
        Update: {
          activo?: boolean
          condicion?: Json
          created_at?: string
          description?: string | null
          id?: string
          nombre?: string
          valor?: number
        }
        Relationships: []
      }
      lead_segment_assignments: {
        Row: {
          assigned_at: string
          id: string
          lead_id: string
          segment_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          lead_id: string
          segment_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          lead_id?: string
          segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_segment_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_segment_assignments_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "lead_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_segments: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          criteria: Json
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          lead_id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number
          execution_data: Json | null
          id: string
          lead_id: string
          started_at: string
          status: string
          template_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          execution_data?: Json | null
          id?: string
          lead_id: string
          started_at?: string
          status?: string
          template_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          execution_data?: Json | null
          id?: string
          lead_id?: string
          started_at?: string
          status?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_workflow_executions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_workflow_executions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "lead_workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_workflow_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          trigger_conditions: Json
          updated_at: string
          workflow_steps: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          trigger_conditions?: Json
          updated_at?: string
          workflow_steps?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          trigger_conditions?: Json
          updated_at?: string
          workflow_steps?: Json
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to_id: string | null
          collaborator_id: string | null
          company_id: string | null
          company_name: string | null
          conversion_date: string | null
          converted_to_mandate_id: string | null
          created_at: string
          created_by: string | null
          deal_value: number | null
          email: string
          estimated_close_date: string | null
          highlighted: boolean | null
          id: string
          is_followed: boolean | null
          job_title: string | null
          last_activity_type: string | null
          last_contacted: string | null
          last_winback_attempt: string | null
          lead_name: string | null
          lead_origin: string
          lead_score: number | null
          lead_type: Database["public"]["Enums"]["lead_type"] | null
          lost_date: string | null
          lost_reason: string | null
          message: string | null
          name: string
          next_activity_date: string | null
          next_follow_up_date: string | null
          phone: string | null
          pipeline_stage_id: string | null
          priority: string | null
          prob_conversion: number | null
          probability: number | null
          quality: string | null
          rod_order: number | null
          service_type: string | null
          source: string
          stage_id: string | null
          status: Database["public"]["Enums"]["lead_status"]
          tags: string[] | null
          updated_at: string
          winback_stage: string | null
          won_date: string | null
        }
        Insert: {
          assigned_to_id?: string | null
          collaborator_id?: string | null
          company_id?: string | null
          company_name?: string | null
          conversion_date?: string | null
          converted_to_mandate_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_value?: number | null
          email: string
          estimated_close_date?: string | null
          highlighted?: boolean | null
          id?: string
          is_followed?: boolean | null
          job_title?: string | null
          last_activity_type?: string | null
          last_contacted?: string | null
          last_winback_attempt?: string | null
          lead_name?: string | null
          lead_origin?: string
          lead_score?: number | null
          lead_type?: Database["public"]["Enums"]["lead_type"] | null
          lost_date?: string | null
          lost_reason?: string | null
          message?: string | null
          name: string
          next_activity_date?: string | null
          next_follow_up_date?: string | null
          phone?: string | null
          pipeline_stage_id?: string | null
          priority?: string | null
          prob_conversion?: number | null
          probability?: number | null
          quality?: string | null
          rod_order?: number | null
          service_type?: string | null
          source: string
          stage_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          updated_at?: string
          winback_stage?: string | null
          won_date?: string | null
        }
        Update: {
          assigned_to_id?: string | null
          collaborator_id?: string | null
          company_id?: string | null
          company_name?: string | null
          conversion_date?: string | null
          converted_to_mandate_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_value?: number | null
          email?: string
          estimated_close_date?: string | null
          highlighted?: boolean | null
          id?: string
          is_followed?: boolean | null
          job_title?: string | null
          last_activity_type?: string | null
          last_contacted?: string | null
          last_winback_attempt?: string | null
          lead_name?: string | null
          lead_origin?: string
          lead_score?: number | null
          lead_type?: Database["public"]["Enums"]["lead_type"] | null
          lost_date?: string | null
          lost_reason?: string | null
          message?: string | null
          name?: string
          next_activity_date?: string | null
          next_follow_up_date?: string | null
          phone?: string | null
          pipeline_stage_id?: string | null
          priority?: string | null
          prob_conversion?: number | null
          probability?: number | null
          quality?: string | null
          rod_order?: number | null
          service_type?: string | null
          source?: string
          stage_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          updated_at?: string
          winback_stage?: string | null
          won_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_to_mandate_id_fkey"
            columns: ["converted_to_mandate_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_pipeline_stage_id_fkey"
            columns: ["pipeline_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_pipeline_stage_id_fkey"
            columns: ["pipeline_stage_id"]
            isOneToOne: false
            referencedRelation: "vw_leads_funnel"
            referencedColumns: ["stage_id"]
          },
          {
            foreignKeyName: "leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      mandate_client_access: {
        Row: {
          access_token: string
          client_email: string
          created_at: string | null
          created_by: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          last_accessed_at: string | null
          mandate_id: string
          updated_at: string | null
        }
        Insert: {
          access_token: string
          client_email: string
          created_at?: string | null
          created_by?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          mandate_id: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          client_email?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          mandate_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mandate_client_access_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
            referencedColumns: ["id"]
          },
        ]
      }
      mandate_comments: {
        Row: {
          client_access_id: string | null
          comment_text: string
          comment_type: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_client_visible: boolean | null
          mandate_id: string
          target_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_access_id?: string | null
          comment_text: string
          comment_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_client_visible?: boolean | null
          mandate_id: string
          target_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_access_id?: string | null
          comment_text?: string
          comment_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_client_visible?: boolean | null
          mandate_id?: string
          target_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mandate_comments_client_access_id_fkey"
            columns: ["client_access_id"]
            isOneToOne: false
            referencedRelation: "mandate_client_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandate_comments_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandate_comments_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "mandate_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      mandate_documents: {
        Row: {
          content_type: string | null
          created_at: string | null
          document_name: string
          document_type: string
          file_size: number | null
          file_url: string
          id: string
          is_confidential: boolean | null
          mandate_id: string
          notes: string | null
          target_id: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          document_name: string
          document_type?: string
          file_size?: number | null
          file_url: string
          id?: string
          is_confidential?: boolean | null
          mandate_id: string
          notes?: string | null
          target_id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          document_name?: string
          document_type?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_confidential?: boolean | null
          mandate_id?: string
          notes?: string | null
          target_id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mandate_documents_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandate_documents_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "mandate_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      mandate_notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          mandate_id: string
          note: string
          note_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          mandate_id: string
          note: string
          note_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          mandate_id?: string
          note?: string
          note_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mandate_notes_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
            referencedColumns: ["id"]
          },
        ]
      }
      mandate_people: {
        Row: {
          company: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_primary: boolean
          mandate_id: string
          name: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          mandate_id: string
          name: string
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          mandate_id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mandate_people_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
            referencedColumns: ["id"]
          },
        ]
      }
      mandate_target_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          target_id: string
          title: string
          updated_at: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          target_id: string
          title: string
          updated_at?: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          target_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mandate_target_enrichments: {
        Row: {
          confidence_score: number | null
          created_at: string
          enriched_at: string
          enrichment_data: Json
          id: string
          source: string
          target_id: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          enriched_at?: string
          enrichment_data?: Json
          id?: string
          source?: string
          target_id: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          enriched_at?: string
          enrichment_data?: Json
          id?: string
          source?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      mandate_target_followups: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          followup_type: string
          id: string
          is_completed: boolean | null
          priority: string | null
          scheduled_date: string
          target_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          followup_type?: string
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          scheduled_date: string
          target_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          followup_type?: string
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          scheduled_date?: string
          target_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mandate_targets: {
        Row: {
          company_name: string
          contact_date: string | null
          contact_email: string | null
          contact_method: string | null
          contact_name: string | null
          contact_phone: string | null
          contacted: boolean | null
          created_at: string | null
          created_by: string | null
          ebitda: number | null
          id: string
          location: string | null
          mandate_id: string
          notes: string | null
          responsible_user_id: string | null
          revenues: number | null
          sector: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_name: string
          contact_date?: string | null
          contact_email?: string | null
          contact_method?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contacted?: boolean | null
          created_at?: string | null
          created_by?: string | null
          ebitda?: number | null
          id?: string
          location?: string | null
          mandate_id: string
          notes?: string | null
          responsible_user_id?: string | null
          revenues?: number | null
          sector?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          contact_date?: string | null
          contact_email?: string | null
          contact_method?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contacted?: boolean | null
          created_at?: string | null
          created_by?: string | null
          ebitda?: number | null
          id?: string
          location?: string | null
          mandate_id?: string
          notes?: string | null
          responsible_user_id?: string | null
          revenues?: number | null
          sector?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mandate_targets_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
            referencedColumns: ["id"]
          },
        ]
      }
      mandate_tasks: {
        Row: {
          assigned_to: string | null
          completed: boolean
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          mandate_id: string
          priority: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          mandate_id: string
          priority?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          mandate_id?: string
          priority?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mandate_tasks_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
            referencedColumns: ["id"]
          },
        ]
      }
      ndas: {
        Row: {
          created_at: string
          created_by: string | null
          document_url: string | null
          expires_at: string | null
          id: string
          nda_type: string
          notes: string | null
          sent_at: string | null
          signed_at: string | null
          signed_by_advisor: boolean | null
          signed_by_client: boolean | null
          status: string
          terms_and_conditions: string | null
          transaction_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          expires_at?: string | null
          id?: string
          nda_type?: string
          notes?: string | null
          sent_at?: string | null
          signed_at?: string | null
          signed_by_advisor?: boolean | null
          signed_by_client?: boolean | null
          status?: string
          terms_and_conditions?: string | null
          transaction_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          expires_at?: string | null
          id?: string
          nda_type?: string
          notes?: string | null
          sent_at?: string | null
          signed_at?: string | null
          signed_by_advisor?: boolean | null
          signed_by_client?: boolean | null
          status?: string
          terms_and_conditions?: string | null
          transaction_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      negocio_activities: {
        Row: {
          activity_date: string
          activity_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          metadata: Json | null
          negocio_id: string
          title: string
          updated_at: string
        }
        Insert: {
          activity_date?: string
          activity_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          negocio_id: string
          title: string
          updated_at?: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          negocio_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_negocio_activities_negocio"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_negocio_activities_negocio"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "hubspot_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_negocio_activities_negocio"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "hubspot_deals_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      negocios: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          descripcion: string | null
          ebitda: number | null
          empleados: number | null
          fecha_cierre: string | null
          fuente_lead: string | null
          id: string
          ingresos: number | null
          is_active: boolean
          moneda: string | null
          multiplicador: number | null
          nombre_negocio: string
          notas: string | null
          prioridad: string | null
          propietario_negocio: string | null
          proxima_actividad: string | null
          sector: string | null
          stage_id: string | null
          tipo_negocio: string
          ubicacion: string | null
          updated_at: string
          valor_negocio: number | null
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          ebitda?: number | null
          empleados?: number | null
          fecha_cierre?: string | null
          fuente_lead?: string | null
          id?: string
          ingresos?: number | null
          is_active?: boolean
          moneda?: string | null
          multiplicador?: number | null
          nombre_negocio: string
          notas?: string | null
          prioridad?: string | null
          propietario_negocio?: string | null
          proxima_actividad?: string | null
          sector?: string | null
          stage_id?: string | null
          tipo_negocio?: string
          ubicacion?: string | null
          updated_at?: string
          valor_negocio?: number | null
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          ebitda?: number | null
          empleados?: number | null
          fecha_cierre?: string | null
          fuente_lead?: string | null
          id?: string
          ingresos?: number | null
          is_active?: boolean
          moneda?: string | null
          multiplicador?: number | null
          nombre_negocio?: string
          notas?: string | null
          prioridad?: string | null
          propietario_negocio?: string | null
          proxima_actividad?: string | null
          sector?: string | null
          stage_id?: string | null
          tipo_negocio?: string
          ubicacion?: string | null
          updated_at?: string
          valor_negocio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "negocios_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negocios_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negocios_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negocios_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negocios_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negocios_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negocios_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          delivery_status: string | null
          id: string
          lead_id: string | null
          message: string
          metadata: Json | null
          notification_type: string
          recipient_user_id: string | null
          rule_id: string | null
          sent_at: string | null
          task_id: string | null
        }
        Insert: {
          delivery_status?: string | null
          id?: string
          lead_id?: string | null
          message: string
          metadata?: Json | null
          notification_type: string
          recipient_user_id?: string | null
          rule_id?: string | null
          sent_at?: string | null
          task_id?: string | null
        }
        Update: {
          delivery_status?: string | null
          id?: string
          lead_id?: string | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          recipient_user_id?: string | null
          rule_id?: string | null
          sent_at?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "notification_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lead_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_rules: {
        Row: {
          conditions: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          notification_config: Json
          rule_name: string
          rule_type: string
          updated_at: string | null
        }
        Insert: {
          conditions: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          notification_config: Json
          rule_name: string
          rule_type: string
          updated_at?: string | null
        }
        Update: {
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          notification_config?: Json
          rule_name?: string
          rule_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nurturing_sequences: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          trigger_criteria: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          trigger_criteria?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          trigger_criteria?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      nurturing_steps: {
        Row: {
          condition_criteria: Json | null
          delay_days: number
          email_template_id: string | null
          id: string
          is_active: boolean
          sequence_id: string
          step_order: number
          step_type: string
          task_description: string | null
        }
        Insert: {
          condition_criteria?: Json | null
          delay_days?: number
          email_template_id?: string | null
          id?: string
          is_active?: boolean
          sequence_id: string
          step_order: number
          step_type: string
          task_description?: string | null
        }
        Update: {
          condition_criteria?: Json | null
          delay_days?: number
          email_template_id?: string | null
          id?: string
          is_active?: boolean
          sequence_id?: string
          step_order?: number
          step_type?: string
          task_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nurturing_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "nurturing_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      nylas_accounts: {
        Row: {
          access_token: string | null
          account_status: string
          connector_id: string | null
          created_at: string | null
          email_address: string
          grant_id: string | null
          id: string
          last_sync_at: string | null
          provider: string
          settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_status?: string
          connector_id?: string | null
          created_at?: string | null
          email_address: string
          grant_id?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_status?: string
          connector_id?: string | null
          created_at?: string | null
          email_address?: string
          grant_id?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      operation_managers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          photo: string | null
          position: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          photo?: string | null
          position?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          photo?: string | null
          position?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      operations: {
        Row: {
          amount: number
          annual_growth_rate: number | null
          buyer: string | null
          cif: string | null
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          currency: string
          date: string
          description: string | null
          ebitda: number | null
          highlighted: boolean | null
          id: string
          location: string | null
          manager_id: string | null
          operation_type: string
          photo_url: string | null
          project_name: string | null
          revenue: number | null
          rod_order: number | null
          sector: string
          seller: string | null
          stage_id: string | null
          status: string
          teaser_url: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          annual_growth_rate?: number | null
          buyer?: string | null
          cif?: string | null
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          date: string
          description?: string | null
          ebitda?: number | null
          highlighted?: boolean | null
          id?: string
          location?: string | null
          manager_id?: string | null
          operation_type: string
          photo_url?: string | null
          project_name?: string | null
          revenue?: number | null
          rod_order?: number | null
          sector: string
          seller?: string | null
          stage_id?: string | null
          status?: string
          teaser_url?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          annual_growth_rate?: number | null
          buyer?: string | null
          cif?: string | null
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          date?: string
          description?: string | null
          ebitda?: number | null
          highlighted?: boolean | null
          id?: string
          location?: string | null
          manager_id?: string | null
          operation_type?: string
          photo_url?: string | null
          project_name?: string | null
          revenue?: number | null
          rod_order?: number | null
          sector?: string
          seller?: string | null
          stage_id?: string | null
          status?: string
          teaser_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operations_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "operation_managers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operations_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          assigned_to: string | null
          close_date: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          deal_source: string | null
          description: string | null
          ebitda: number | null
          employees: number | null
          highlighted: boolean | null
          id: string
          is_active: boolean
          location: string | null
          multiplier: number | null
          notes: string | null
          opportunity_type: string
          priority: string | null
          probability: number | null
          revenue: number | null
          rod_order: number | null
          sector: string | null
          stage: string
          status: string
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          close_date?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deal_source?: string | null
          description?: string | null
          ebitda?: number | null
          employees?: number | null
          highlighted?: boolean | null
          id?: string
          is_active?: boolean
          location?: string | null
          multiplier?: number | null
          notes?: string | null
          opportunity_type?: string
          priority?: string | null
          probability?: number | null
          revenue?: number | null
          rod_order?: number | null
          sector?: string | null
          stage?: string
          status?: string
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          close_date?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deal_source?: string | null
          description?: string | null
          ebitda?: number | null
          employees?: number | null
          highlighted?: boolean | null
          id?: string
          is_active?: boolean
          location?: string | null
          multiplier?: number | null
          notes?: string | null
          opportunity_type?: string
          priority?: string | null
          probability?: number | null
          revenue?: number | null
          rod_order?: number | null
          sector?: string | null
          stage?: string
          status?: string
          title?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_contacts: {
        Row: {
          contact_id: string
          created_at: string
          created_by: string | null
          id: string
          is_primary: boolean | null
          notes: string | null
          opportunity_id: string
          role: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          opportunity_id: string
          role?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          opportunity_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_contacts_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          module: string
          name: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          module: string
          name: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          stage_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          stage_order: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          stage_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      pipelines: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      planned_tasks: {
        Row: {
          contact_id: string | null
          created_at: string
          date: string
          description: string | null
          estimated_duration: number | null
          id: string
          lead_id: string | null
          operation_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          target_company_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          date: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          lead_id?: string | null
          operation_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          target_company_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          lead_id?: string | null
          operation_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          target_company_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_tasks_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_tasks_target_company_id_fkey"
            columns: ["target_company_id"]
            isOneToOne: false
            referencedRelation: "target_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_areas: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          id: string
          notes: string | null
          practice_area_id: string | null
          proposal_type: string
          status: string
          terms_and_conditions: string | null
          title: string
          total_amount: number | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          practice_area_id?: string | null
          proposal_type?: string
          status?: string
          terms_and_conditions?: string | null
          title: string
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          practice_area_id?: string | null
          proposal_type?: string
          status?: string
          terms_and_conditions?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_practice_area_id_fkey"
            columns: ["practice_area_id"]
            isOneToOne: false
            referencedRelation: "practice_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedores: {
        Row: {
          company_id_origen: number | null
          datos_completos: Json | null
          email: string | null
          nif: string | null
          nombre: string | null
          regid: number
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          company_id_origen?: number | null
          datos_completos?: Json | null
          email?: string | null
          nif?: string | null
          nombre?: string | null
          regid: number
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id_origen?: number | null
          datos_completos?: Json | null
          email?: string | null
          nif?: string | null
          nombre?: string | null
          regid?: number
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      reconversion_approvals: {
        Row: {
          aprobado: boolean | null
          aprobado_en: string | null
          aprobado_por_id: string | null
          comentario: string | null
          created_at: string
          etapa: string
          id: string
          reconversion_id: string
        }
        Insert: {
          aprobado?: boolean | null
          aprobado_en?: string | null
          aprobado_por_id?: string | null
          comentario?: string | null
          created_at?: string
          etapa: string
          id?: string
          reconversion_id: string
        }
        Update: {
          aprobado?: boolean | null
          aprobado_en?: string | null
          aprobado_por_id?: string | null
          comentario?: string | null
          created_at?: string
          etapa?: string
          id?: string
          reconversion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconversion_approvals_reconversion_id_fkey"
            columns: ["reconversion_id"]
            isOneToOne: false
            referencedRelation: "reconversiones_new"
            referencedColumns: ["id"]
          },
        ]
      }
      reconversion_audit_logs: {
        Row: {
          action_description: string
          action_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          reconversion_id: string
          severity: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          reconversion_id: string
          severity?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          reconversion_id?: string
          severity?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconversion_audit_logs_reconversion_id_fkey"
            columns: ["reconversion_id"]
            isOneToOne: false
            referencedRelation: "reconversiones"
            referencedColumns: ["id"]
          },
        ]
      }
      reconversion_documents: {
        Row: {
          created_at: string | null
          created_by: string | null
          document_name: string
          document_type: string
          file_url: string | null
          id: string
          reconversion_id: string
          sent_at: string | null
          sent_to: string | null
          signed_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          document_name: string
          document_type: string
          file_url?: string | null
          id?: string
          reconversion_id: string
          sent_at?: string | null
          sent_to?: string | null
          signed_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          document_name?: string
          document_type?: string
          file_url?: string | null
          id?: string
          reconversion_id?: string
          sent_at?: string | null
          sent_to?: string | null
          signed_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reconversion_documents_reconversion_id_fkey"
            columns: ["reconversion_id"]
            isOneToOne: false
            referencedRelation: "reconversiones_new"
            referencedColumns: ["id"]
          },
        ]
      }
      reconversion_matches: {
        Row: {
          created_at: string
          enviado_al_comprador: boolean
          etapa_match: string | null
          fecha_envio: string | null
          id: string
          reconversion_id: string
          score: number | null
          target_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enviado_al_comprador?: boolean
          etapa_match?: string | null
          fecha_envio?: string | null
          id?: string
          reconversion_id: string
          score?: number | null
          target_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enviado_al_comprador?: boolean
          etapa_match?: string | null
          fecha_envio?: string | null
          id?: string
          reconversion_id?: string
          score?: number | null
          target_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconversion_matches_reconversion_id_fkey"
            columns: ["reconversion_id"]
            isOneToOne: false
            referencedRelation: "reconversiones_new"
            referencedColumns: ["id"]
          },
        ]
      }
      reconversion_notifications: {
        Row: {
          created_at: string
          email_sent_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          recipient_email: string
          recipient_user_id: string
          reconversion_id: string
          sent_email: boolean | null
          sent_in_app: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_sent_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          recipient_email: string
          recipient_user_id: string
          reconversion_id: string
          sent_email?: boolean | null
          sent_in_app?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_sent_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          recipient_email?: string
          recipient_user_id?: string
          reconversion_id?: string
          sent_email?: boolean | null
          sent_in_app?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconversion_notifications_reconversion_id_fkey"
            columns: ["reconversion_id"]
            isOneToOne: false
            referencedRelation: "reconversiones"
            referencedColumns: ["id"]
          },
        ]
      }
      reconversion_preferences: {
        Row: {
          clave: string
          created_at: string
          id: string
          reconversion_id: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          clave: string
          created_at?: string
          id?: string
          reconversion_id: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          clave?: string
          created_at?: string
          id?: string
          reconversion_id?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reconversion_preferences_reconversion_id_fkey"
            columns: ["reconversion_id"]
            isOneToOne: false
            referencedRelation: "reconversiones_new"
            referencedColumns: ["id"]
          },
        ]
      }
      reconversiones: {
        Row: {
          assigned_to: string | null
          buyer_company_name: string | null
          buyer_contact_info: Json | null
          company_name: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          conversion_probability: number | null
          created_at: string
          created_by: string | null
          deal_structure_preferences: string[] | null
          ebitda_range_max: number | null
          ebitda_range_min: number | null
          id: string
          investment_capacity: number | null
          investment_capacity_max: number | null
          investment_capacity_min: number | null
          max_ebitda: number | null
          max_revenue: number | null
          min_ebitda: number | null
          min_revenue: number | null
          new_requirements: Json | null
          next_contact_date: string | null
          notes: string | null
          original_lead_id: string | null
          original_mandate_id: string | null
          original_rejection_reason: string | null
          rejection_reason: string
          revenue_range_max: number | null
          revenue_range_min: number | null
          status: string
          target_locations: string[] | null
          target_sectors: string[] | null
          timeline_horizon: string | null
          timeline_preference: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          buyer_company_name?: string | null
          buyer_contact_info?: Json | null
          company_name?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          conversion_probability?: number | null
          created_at?: string
          created_by?: string | null
          deal_structure_preferences?: string[] | null
          ebitda_range_max?: number | null
          ebitda_range_min?: number | null
          id?: string
          investment_capacity?: number | null
          investment_capacity_max?: number | null
          investment_capacity_min?: number | null
          max_ebitda?: number | null
          max_revenue?: number | null
          min_ebitda?: number | null
          min_revenue?: number | null
          new_requirements?: Json | null
          next_contact_date?: string | null
          notes?: string | null
          original_lead_id?: string | null
          original_mandate_id?: string | null
          original_rejection_reason?: string | null
          rejection_reason: string
          revenue_range_max?: number | null
          revenue_range_min?: number | null
          status?: string
          target_locations?: string[] | null
          target_sectors?: string[] | null
          timeline_horizon?: string | null
          timeline_preference?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          buyer_company_name?: string | null
          buyer_contact_info?: Json | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          conversion_probability?: number | null
          created_at?: string
          created_by?: string | null
          deal_structure_preferences?: string[] | null
          ebitda_range_max?: number | null
          ebitda_range_min?: number | null
          id?: string
          investment_capacity?: number | null
          investment_capacity_max?: number | null
          investment_capacity_min?: number | null
          max_ebitda?: number | null
          max_revenue?: number | null
          min_ebitda?: number | null
          min_revenue?: number | null
          new_requirements?: Json | null
          next_contact_date?: string | null
          notes?: string | null
          original_lead_id?: string | null
          original_mandate_id?: string | null
          original_rejection_reason?: string | null
          rejection_reason?: string
          revenue_range_max?: number | null
          revenue_range_min?: number | null
          status?: string
          target_locations?: string[] | null
          target_sectors?: string[] | null
          timeline_horizon?: string | null
          timeline_preference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reconversiones_new: {
        Row: {
          assigned_to: string | null
          business_model_preferences: string[] | null
          company_name: string | null
          comprador_id: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contacto_id: string | null
          created_at: string
          created_by: string | null
          enterprise_value: number | null
          equity_percentage: number | null
          estado: Database["public"]["Enums"]["reconversion_estado_type"]
          estrategia: string | null
          fecha_cierre: string | null
          fecha_objetivo_cierre: string | null
          geographic_preferences: string[] | null
          id: string
          investment_capacity_max: number | null
          investment_capacity_min: number | null
          last_activity_at: string
          last_matching_at: string | null
          mandato_origen_id: string | null
          matched_targets_count: number | null
          matched_targets_data: Json | null
          motive: string | null
          notes: string | null
          original_lead_id: string | null
          original_mandate_id: string | null
          pipeline_owner_id: string | null
          porcentaje_objetivo: number | null
          prioridad: Database["public"]["Enums"]["reconversion_prioridad_type"]
          rejection_reason: string | null
          subfase: Database["public"]["Enums"]["reconversion_subfase_type"]
          target_sectors: string[] | null
          ticket_max: number | null
          ticket_min: number | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          business_model_preferences?: string[] | null
          company_name?: string | null
          comprador_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contacto_id?: string | null
          created_at?: string
          created_by?: string | null
          enterprise_value?: number | null
          equity_percentage?: number | null
          estado?: Database["public"]["Enums"]["reconversion_estado_type"]
          estrategia?: string | null
          fecha_cierre?: string | null
          fecha_objetivo_cierre?: string | null
          geographic_preferences?: string[] | null
          id?: string
          investment_capacity_max?: number | null
          investment_capacity_min?: number | null
          last_activity_at?: string
          last_matching_at?: string | null
          mandato_origen_id?: string | null
          matched_targets_count?: number | null
          matched_targets_data?: Json | null
          motive?: string | null
          notes?: string | null
          original_lead_id?: string | null
          original_mandate_id?: string | null
          pipeline_owner_id?: string | null
          porcentaje_objetivo?: number | null
          prioridad?: Database["public"]["Enums"]["reconversion_prioridad_type"]
          rejection_reason?: string | null
          subfase?: Database["public"]["Enums"]["reconversion_subfase_type"]
          target_sectors?: string[] | null
          ticket_max?: number | null
          ticket_min?: number | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          business_model_preferences?: string[] | null
          company_name?: string | null
          comprador_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contacto_id?: string | null
          created_at?: string
          created_by?: string | null
          enterprise_value?: number | null
          equity_percentage?: number | null
          estado?: Database["public"]["Enums"]["reconversion_estado_type"]
          estrategia?: string | null
          fecha_cierre?: string | null
          fecha_objetivo_cierre?: string | null
          geographic_preferences?: string[] | null
          id?: string
          investment_capacity_max?: number | null
          investment_capacity_min?: number | null
          last_activity_at?: string
          last_matching_at?: string | null
          mandato_origen_id?: string | null
          matched_targets_count?: number | null
          matched_targets_data?: Json | null
          motive?: string | null
          notes?: string | null
          original_lead_id?: string | null
          original_mandate_id?: string | null
          pipeline_owner_id?: string | null
          porcentaje_objetivo?: number | null
          prioridad?: Database["public"]["Enums"]["reconversion_prioridad_type"]
          rejection_reason?: string | null
          subfase?: Database["public"]["Enums"]["reconversion_subfase_type"]
          target_sectors?: string[] | null
          ticket_max?: number | null
          ticket_min?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reconversiones_new_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconversiones_new_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconversiones_new_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconversiones_new_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconversiones_new_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconversiones_new_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconversiones_new_mandato_origen_id_fkey"
            columns: ["mandato_origen_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_fees: {
        Row: {
          amount: number
          billing_frequency: string
          billing_type: string
          company_id: string | null
          contact_id: string
          created_at: string
          created_by: string | null
          currency: string | null
          end_date: string | null
          fee_name: string
          id: string
          is_active: boolean
          notes: string | null
          practice_area_id: string
          proposal_id: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          billing_frequency?: string
          billing_type?: string
          company_id?: string | null
          contact_id: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          end_date?: string | null
          fee_name: string
          id?: string
          is_active?: boolean
          notes?: string | null
          practice_area_id: string
          proposal_id?: string | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_frequency?: string
          billing_type?: string
          company_id?: string | null
          contact_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          end_date?: string | null
          fee_name?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          practice_area_id?: string
          proposal_id?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_fees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_fees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_fees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_fees_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_fees_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_fees_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_fees_practice_area_id_fkey"
            columns: ["practice_area_id"]
            isOneToOne: false
            referencedRelation: "practice_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_fees_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      rod_log: {
        Row: {
          created_by: string | null
          deals: Json
          id: string
          sent_at: string
        }
        Insert: {
          created_by?: string | null
          deals?: Json
          id?: string
          sent_at?: string
        }
        Update: {
          created_by?: string | null
          deals?: Json
          id?: string
          sent_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_status: {
        Row: {
          audit_type: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          fix_required: string | null
          id: string
          status: string
        }
        Insert: {
          audit_type: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          fix_required?: string | null
          id?: string
          status?: string
        }
        Update: {
          audit_type?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          fix_required?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string | null
          description: string
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          severity: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      stages: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          order_index: number
          pipeline_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          order_index: number
          pipeline_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
          pipeline_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          segment: string
          unsubscribed: boolean
          verified: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          segment?: string
          unsubscribed?: boolean
          verified?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          segment?: string
          unsubscribed?: boolean
          verified?: boolean
        }
        Relationships: []
      }
      target_companies: {
        Row: {
          created_at: string
          created_by_user_id: string
          description: string | null
          ebitda: number | null
          fit_score: number | null
          id: string
          industry: string | null
          investment_thesis: string | null
          name: string
          revenue: number | null
          source_notes: string | null
          stage_id: string | null
          status: Database["public"]["Enums"]["target_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id: string
          description?: string | null
          ebitda?: number | null
          fit_score?: number | null
          id?: string
          industry?: string | null
          investment_thesis?: string | null
          name: string
          revenue?: number | null
          source_notes?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["target_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: string
          description?: string | null
          ebitda?: number | null
          fit_score?: number | null
          id?: string
          industry?: string | null
          investment_thesis?: string | null
          name?: string
          revenue?: number | null
          source_notes?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["target_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "target_companies_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      target_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          linkedin_url: string | null
          name: string
          target_company_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name: string
          target_company_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          target_company_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "target_contacts_target_company_id_fkey"
            columns: ["target_company_id"]
            isOneToOne: false
            referencedRelation: "target_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      task_notifications: {
        Row: {
          created_at: string | null
          days_overdue: number
          email_sent_at: string | null
          entity_id: string | null
          entity_name: string | null
          id: string
          message: string
          notification_type: string
          read_at: string | null
          task_id: string
          task_title: string
          task_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          days_overdue?: number
          email_sent_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          id?: string
          message: string
          notification_type: string
          read_at?: string | null
          task_id: string
          task_title: string
          task_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          days_overdue?: number
          email_sent_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          id?: string
          message?: string
          notification_type?: string
          read_at?: string | null
          task_id?: string
          task_title?: string
          task_type?: string
          user_id?: string
        }
        Relationships: []
      }
      teasers: {
        Row: {
          anonymous_company_name: string | null
          asking_price: number | null
          created_at: string
          created_by: string | null
          currency: string | null
          distributed_at: string | null
          document_url: string | null
          ebitda: number | null
          employees: number | null
          expires_at: string | null
          financial_summary: Json | null
          id: string
          key_highlights: string[] | null
          location: string | null
          mandate_id: string | null
          revenue: number | null
          sector: string | null
          status: string
          teaser_type: string
          title: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          anonymous_company_name?: string | null
          asking_price?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          distributed_at?: string | null
          document_url?: string | null
          ebitda?: number | null
          employees?: number | null
          expires_at?: string | null
          financial_summary?: Json | null
          id?: string
          key_highlights?: string[] | null
          location?: string | null
          mandate_id?: string | null
          revenue?: number | null
          sector?: string | null
          status?: string
          teaser_type?: string
          title: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          anonymous_company_name?: string | null
          asking_price?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          distributed_at?: string | null
          document_url?: string | null
          ebitda?: number | null
          employees?: number | null
          expires_at?: string | null
          financial_summary?: Json | null
          id?: string
          key_highlights?: string[] | null
          location?: string | null
          mandate_id?: string | null
          revenue?: number | null
          sector?: string | null
          status?: string
          teaser_type?: string
          title?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teasers_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teasers_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          activity_type: string
          contact_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          hourly_rate: number | null
          id: string
          is_billable: boolean
          operation_id: string | null
          planned_task_id: string | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type?: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean
          operation_id?: string | null
          planned_task_id?: string | null
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean
          operation_id?: string | null
          planned_task_id?: string | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_planned_task_id_fkey"
            columns: ["planned_task_id"]
            isOneToOne: false
            referencedRelation: "planned_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      time_goals: {
        Row: {
          activity_type: string | null
          created_at: string
          goal_type: string
          id: string
          is_active: boolean
          target_hours: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          created_at?: string
          goal_type: string
          id?: string
          is_active?: boolean
          target_hours: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string | null
          created_at?: string
          goal_type?: string
          id?: string
          is_active?: boolean
          target_hours?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tracked_emails: {
        Row: {
          contact_id: string | null
          content: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          lead_id: string | null
          nylas_account_id: string | null
          nylas_message_id: string | null
          nylas_thread_id: string | null
          open_count: number
          opened_at: string | null
          operation_id: string | null
          recipient_email: string
          sent_at: string
          status: Database["public"]["Enums"]["email_status"]
          subject: string | null
          target_company_id: string | null
          tracking_id: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          contact_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          lead_id?: string | null
          nylas_account_id?: string | null
          nylas_message_id?: string | null
          nylas_thread_id?: string | null
          open_count?: number
          opened_at?: string | null
          operation_id?: string | null
          recipient_email: string
          sent_at?: string
          status?: Database["public"]["Enums"]["email_status"]
          subject?: string | null
          target_company_id?: string | null
          tracking_id?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          contact_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          lead_id?: string | null
          nylas_account_id?: string | null
          nylas_message_id?: string | null
          nylas_thread_id?: string | null
          open_count?: number
          opened_at?: string | null
          operation_id?: string | null
          recipient_email?: string
          sent_at?: string
          status?: Database["public"]["Enums"]["email_status"]
          subject?: string | null
          target_company_id?: string | null
          tracking_id?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracked_emails_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_emails_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_emails_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_emails_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_emails_nylas_account_id_fkey"
            columns: ["nylas_account_id"]
            isOneToOne: false
            referencedRelation: "nylas_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_emails_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_emails_target_company_id_fkey"
            columns: ["target_company_id"]
            isOneToOne: false
            referencedRelation: "target_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      transacciones: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          descripcion: string | null
          ebitda: number | null
          empleados: number | null
          fecha_cierre: string | null
          fuente_lead: string | null
          id: string
          ingresos: number | null
          is_active: boolean
          moneda: string | null
          multiplicador: number | null
          nombre_transaccion: string
          notas: string | null
          prioridad: string | null
          propietario_transaccion: string | null
          proxima_actividad: string | null
          sector: string | null
          stage_id: string | null
          tipo_transaccion: string
          ubicacion: string | null
          updated_at: string
          valor_transaccion: number | null
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          ebitda?: number | null
          empleados?: number | null
          fecha_cierre?: string | null
          fuente_lead?: string | null
          id?: string
          ingresos?: number | null
          is_active?: boolean
          moneda?: string | null
          multiplicador?: number | null
          nombre_transaccion: string
          notas?: string | null
          prioridad?: string | null
          propietario_transaccion?: string | null
          proxima_actividad?: string | null
          sector?: string | null
          stage_id?: string | null
          tipo_transaccion?: string
          ubicacion?: string | null
          updated_at?: string
          valor_transaccion?: number | null
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          ebitda?: number | null
          empleados?: number | null
          fecha_cierre?: string | null
          fuente_lead?: string | null
          id?: string
          ingresos?: number | null
          is_active?: boolean
          moneda?: string | null
          multiplicador?: number | null
          nombre_transaccion?: string
          notas?: string | null
          prioridad?: string | null
          propietario_transaccion?: string | null
          proxima_actividad?: string | null
          sector?: string | null
          stage_id?: string | null
          tipo_transaccion?: string
          ubicacion?: string | null
          updated_at?: string
          valor_transaccion?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transacciones_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_interested_parties: {
        Row: {
          company: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          documents_shared: string[] | null
          email: string | null
          financial_capacity: number | null
          id: string
          interest_level: string
          last_interaction_date: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          process_status: string
          score: number | null
          transaction_id: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          documents_shared?: string[] | null
          email?: string | null
          financial_capacity?: number | null
          id?: string
          interest_level?: string
          last_interaction_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          process_status?: string
          score?: number | null
          transaction_id: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          documents_shared?: string[] | null
          email?: string | null
          financial_capacity?: number | null
          id?: string
          interest_level?: string
          last_interaction_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          process_status?: string
          score?: number | null
          transaction_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      transaction_notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string
          note_type: string | null
          transaccion_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note: string
          note_type?: string | null
          transaccion_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string
          note_type?: string | null
          transaccion_id?: string
        }
        Relationships: []
      }
      transaction_people: {
        Row: {
          company: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_primary: boolean
          name: string
          phone: string | null
          role: string
          transaccion_id: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          name: string
          phone?: string | null
          role: string
          transaccion_id: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          name?: string
          phone?: string | null
          role?: string
          transaccion_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      transaction_tasks: {
        Row: {
          assigned_to: string | null
          completed: boolean
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          title: string
          transaccion_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          title: string
          transaccion_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          title?: string
          transaccion_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_favorite_operations: {
        Row: {
          created_at: string
          id: string
          operation_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          operation_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          operation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_operations_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          step_data: Json | null
          step_id: string
          step_name: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          step_data?: Json | null
          step_id: string
          step_name: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          step_data?: Json | null
          step_id?: string
          step_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          company: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_complete: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_table_preferences: {
        Row: {
          column_preferences: Json
          created_at: string
          id: string
          table_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          column_preferences?: Json
          created_at?: string
          id?: string
          table_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          column_preferences?: Json
          created_at?: string
          id?: string
          table_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tasks: {
        Row: {
          category: string
          completed: boolean | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          priority: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          priority?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          priority?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      valoracion_document_reviews: {
        Row: {
          created_at: string
          document_id: string
          id: string
          new_status: string
          previous_status: string | null
          review_notes: string | null
          reviewed_by: string | null
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          new_status: string
          previous_status?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          new_status?: string
          previous_status?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "valoracion_document_reviews_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "valoracion_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      valoracion_documents: {
        Row: {
          content_type: string
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          review_status: string
          updated_at: string
          uploaded_by: string | null
          valoracion_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          review_status?: string
          updated_at?: string
          uploaded_by?: string | null
          valoracion_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          review_status?: string
          updated_at?: string
          uploaded_by?: string | null
          valoracion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "valoracion_documents_valoracion_id_fkey"
            columns: ["valoracion_id"]
            isOneToOne: false
            referencedRelation: "valoraciones"
            referencedColumns: ["id"]
          },
        ]
      }
      valoracion_inputs: {
        Row: {
          clave: string
          created_at: string
          created_by: string | null
          descripcion: string | null
          id: string
          obligatorio: boolean
          orden_display: number | null
          tipo_dato: string
          updated_at: string
          validacion_reglas: Json | null
          valor: Json
          valoracion_id: string
        }
        Insert: {
          clave: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          id?: string
          obligatorio?: boolean
          orden_display?: number | null
          tipo_dato: string
          updated_at?: string
          validacion_reglas?: Json | null
          valor: Json
          valoracion_id: string
        }
        Update: {
          clave?: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          id?: string
          obligatorio?: boolean
          orden_display?: number | null
          tipo_dato?: string
          updated_at?: string
          validacion_reglas?: Json | null
          valor?: Json
          valoracion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "valoracion_inputs_valoracion_id_fkey"
            columns: ["valoracion_id"]
            isOneToOne: false
            referencedRelation: "valoraciones"
            referencedColumns: ["id"]
          },
        ]
      }
      valoracion_methods: {
        Row: {
          calculation_date: string | null
          comentario: string | null
          confidence_level: number | null
          created_at: string
          created_by: string | null
          id: string
          metodo: string
          resultado: number | null
          updated_at: string
          valoracion_id: string
        }
        Insert: {
          calculation_date?: string | null
          comentario?: string | null
          confidence_level?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          metodo: string
          resultado?: number | null
          updated_at?: string
          valoracion_id: string
        }
        Update: {
          calculation_date?: string | null
          comentario?: string | null
          confidence_level?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          metodo?: string
          resultado?: number | null
          updated_at?: string
          valoracion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "valoracion_methods_valoracion_id_fkey"
            columns: ["valoracion_id"]
            isOneToOne: false
            referencedRelation: "valoraciones"
            referencedColumns: ["id"]
          },
        ]
      }
      valoracion_security_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          severity: string
          user_agent: string | null
          user_id: string | null
          valoracion_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
          valoracion_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
          valoracion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "valoracion_security_logs_valoracion_id_fkey"
            columns: ["valoracion_id"]
            isOneToOne: false
            referencedRelation: "valoraciones"
            referencedColumns: ["id"]
          },
        ]
      }
      valoracion_tasks: {
        Row: {
          assigned_to: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          title: string
          updated_at: string
          valoracion_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          title: string
          updated_at?: string
          valoracion_id: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          title?: string
          updated_at?: string
          valoracion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "valoracion_tasks_valoracion_id_fkey"
            columns: ["valoracion_id"]
            isOneToOne: false
            referencedRelation: "valoraciones"
            referencedColumns: ["id"]
          },
        ]
      }
      valoraciones: {
        Row: {
          analista_id: string | null
          assigned_to: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          company_description: string | null
          company_name: string
          company_sector: string | null
          created_at: string
          created_by: string | null
          delivery_date: string | null
          estimated_value_max: number | null
          estimated_value_min: number | null
          fee_charged: number | null
          fee_currency: string | null
          fee_quoted: number | null
          final_valuation_amount: number | null
          id: string
          last_activity_at: string | null
          metodo_preferente: string | null
          notes: string | null
          payment_date: string | null
          payment_notes: string | null
          payment_status: string | null
          pdf_url: string | null
          priority: string
          requested_date: string
          solicitante_id: number | null
          status: string
          updated_at: string
          valoracion_eqty: number | null
          valoracion_ev: number | null
          valuation_method: string[] | null
          valuation_report_url: string | null
          valuation_type: string
        }
        Insert: {
          analista_id?: string | null
          assigned_to?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          company_description?: string | null
          company_name: string
          company_sector?: string | null
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          estimated_value_max?: number | null
          estimated_value_min?: number | null
          fee_charged?: number | null
          fee_currency?: string | null
          fee_quoted?: number | null
          final_valuation_amount?: number | null
          id?: string
          last_activity_at?: string | null
          metodo_preferente?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          pdf_url?: string | null
          priority?: string
          requested_date?: string
          solicitante_id?: number | null
          status?: string
          updated_at?: string
          valoracion_eqty?: number | null
          valoracion_ev?: number | null
          valuation_method?: string[] | null
          valuation_report_url?: string | null
          valuation_type?: string
        }
        Update: {
          analista_id?: string | null
          assigned_to?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          company_description?: string | null
          company_name?: string
          company_sector?: string | null
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          estimated_value_max?: number | null
          estimated_value_min?: number | null
          fee_charged?: number | null
          fee_currency?: string | null
          fee_quoted?: number | null
          final_valuation_amount?: number | null
          id?: string
          last_activity_at?: string | null
          metodo_preferente?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          pdf_url?: string | null
          priority?: string
          requested_date?: string
          solicitante_id?: number | null
          status?: string
          updated_at?: string
          valoracion_eqty?: number | null
          valoracion_ev?: number | null
          valuation_method?: string[] | null
          valuation_report_url?: string | null
          valuation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "valoraciones_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valoraciones_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["regid"]
          },
        ]
      }
      winback_attempts: {
        Row: {
          canal: string
          created_at: string | null
          created_by: string | null
          executed_date: string | null
          id: string
          lead_id: string
          notes: string | null
          response_data: Json | null
          scheduled_date: string
          sequence_id: string
          status: string | null
          step_index: number
          template_id: string | null
        }
        Insert: {
          canal: string
          created_at?: string | null
          created_by?: string | null
          executed_date?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          response_data?: Json | null
          scheduled_date: string
          sequence_id: string
          status?: string | null
          step_index: number
          template_id?: string | null
        }
        Update: {
          canal?: string
          created_at?: string | null
          created_by?: string | null
          executed_date?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          response_data?: Json | null
          scheduled_date?: string
          sequence_id?: string
          status?: string | null
          step_index?: number
          template_id?: string | null
        }
        Relationships: []
      }
      winback_sequences: {
        Row: {
          activo: boolean | null
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          id: string
          lost_reason_trigger: string | null
          nombre: string
          pasos: Json
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          lost_reason_trigger?: string | null
          nombre: string
          pasos?: Json
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          lost_reason_trigger?: string | null
          nombre?: string
          pasos?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      hubspot_companies: {
        Row: {
          annual_revenue: number | null
          city: string | null
          company_size: Database["public"]["Enums"]["company_size"] | null
          country: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          domain: string | null
          founded_year: number | null
          hubspot_id: string | null
          id: string | null
          industry: string | null
          name: string | null
          phone: string | null
          state: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          annual_revenue?: number | null
          city?: string | null
          company_size?: Database["public"]["Enums"]["company_size"] | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          domain?: string | null
          founded_year?: number | null
          hubspot_id?: string | null
          id?: string | null
          industry?: string | null
          name?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          annual_revenue?: number | null
          city?: string | null
          company_size?: Database["public"]["Enums"]["company_size"] | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          domain?: string | null
          founded_year?: number | null
          hubspot_id?: string | null
          id?: string | null
          industry?: string | null
          name?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      hubspot_companies_with_stats: {
        Row: {
          annual_revenue: number | null
          city: string | null
          company_size: Database["public"]["Enums"]["company_size"] | null
          country: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          domain: string | null
          founded_year: number | null
          hubspot_id: string | null
          id: string | null
          industry: string | null
          name: string | null
          phone: string | null
          state: string | null
          total_contacts: number | null
          total_deals: number | null
          updated_at: string | null
          website: string | null
        }
        Relationships: []
      }
      hubspot_contacts: {
        Row: {
          company: string | null
          company_id: string | null
          contact_roles: Database["public"]["Enums"]["contact_role"][] | null
          contact_status: Database["public"]["Enums"]["contact_status"] | null
          contact_type: string | null
          created_at: string | null
          created_by: string | null
          ecosystem_role: Database["public"]["Enums"]["ecosystem_role"] | null
          email: string | null
          hubspot_id: string | null
          id: string | null
          is_active: boolean | null
          last_interaction_date: string | null
          lifecycle_stage: string | null
          name: string | null
          phone: string | null
          position: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          company_id?: string | null
          contact_roles?: Database["public"]["Enums"]["contact_role"][] | null
          contact_status?: Database["public"]["Enums"]["contact_status"] | null
          contact_type?: string | null
          created_at?: string | null
          created_by?: string | null
          ecosystem_role?: Database["public"]["Enums"]["ecosystem_role"] | null
          email?: string | null
          hubspot_id?: string | null
          id?: string | null
          is_active?: boolean | null
          last_interaction_date?: string | null
          lifecycle_stage?: string | null
          name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          company_id?: string | null
          contact_roles?: Database["public"]["Enums"]["contact_role"][] | null
          contact_status?: Database["public"]["Enums"]["contact_status"] | null
          contact_type?: string | null
          created_at?: string | null
          created_by?: string | null
          ecosystem_role?: Database["public"]["Enums"]["ecosystem_role"] | null
          email?: string | null
          hubspot_id?: string | null
          id?: string | null
          is_active?: boolean | null
          last_interaction_date?: string | null
          lifecycle_stage?: string | null
          name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      hubspot_contacts_with_company: {
        Row: {
          company: string | null
          company_domain: string | null
          company_id: string | null
          company_industry: string | null
          company_name: string | null
          company_website: string | null
          contact_roles: Database["public"]["Enums"]["contact_role"][] | null
          contact_status: Database["public"]["Enums"]["contact_status"] | null
          contact_type: string | null
          created_at: string | null
          created_by: string | null
          ecosystem_role: Database["public"]["Enums"]["ecosystem_role"] | null
          email: string | null
          hubspot_id: string | null
          id: string | null
          is_active: boolean | null
          last_interaction_date: string | null
          lifecycle_stage: string | null
          name: string | null
          phone: string | null
          position: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      hubspot_deals: {
        Row: {
          close_date: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          deal_name: string | null
          deal_type: string | null
          deal_value: number | null
          description: string | null
          hubspot_id: string | null
          id: string | null
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          close_date?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_name?: string | null
          deal_type?: string | null
          deal_value?: number | null
          description?: string | null
          hubspot_id?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          close_date?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_name?: string | null
          deal_type?: string | null
          deal_value?: number | null
          description?: string | null
          hubspot_id?: string | null
          id?: string | null
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
        ]
      }
      hubspot_deals_with_details: {
        Row: {
          close_date: string | null
          company_domain: string | null
          company_name: string | null
          contact_email: string | null
          contact_id: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          deal_name: string | null
          deal_type: string | null
          deal_value: number | null
          description: string | null
          hubspot_id: string | null
          id: string | null
          is_active: boolean | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events_summary: {
        Row: {
          event_count: number | null
          event_type: string | null
          hour: string | null
          severity: string | null
          unique_ips: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      security_status_summary: {
        Row: {
          completed_items: number | null
          completion_percentage: number | null
          pending_items: number | null
          total_items: number | null
        }
        Relationships: []
      }
      vw_leads_funnel: {
        Row: {
          avg_score: number | null
          lead_count: number | null
          performance_rating: string | null
          recent_count: number | null
          stage_color: string | null
          stage_conversion_rate: number | null
          stage_id: string | null
          stage_name: string | null
          stage_order: number | null
        }
        Relationships: []
      }
      vw_leads_kpi: {
        Row: {
          avg_score: number | null
          avg_time_to_qualify_days: number | null
          conversion_rate: number | null
          conversion_trend_data: Json | null
          growth_rate_30d: number | null
          hot_leads: number | null
          leads_trend: string | null
          new_leads_30d: number | null
          new_leads_7d: number | null
          pipeline_value: number | null
          qualified_leads: number | null
          total_leads: number | null
        }
        Relationships: []
      }
      vw_reconversion_kpi: {
        Row: {
          activas: number | null
          canceladas: number | null
          cerradas: number | null
          matching: number | null
          negociando: number | null
          total: number | null
          urgentes: number | null
        }
        Relationships: []
      }
      vw_reconversion_kpi_secure: {
        Row: {
          activas: number | null
          canceladas: number | null
          cerradas: number | null
          matching: number | null
          negociando: number | null
          total: number | null
          urgentes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_owner_on_create: {
        Args: { p_lead_id: string }
        Returns: Json
      }
      assign_role_after_signup: {
        Args: {
          p_user_id: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: Json
      }
      assign_user_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: Json
      }
      assign_user_role_secure: {
        Args: {
          _target_user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: Json
      }
      auto_assign_lead: {
        Args: { p_lead_id: string }
        Returns: string
      }
      calculate_lead_engagement_score: {
        Args: { p_lead_id: string }
        Returns: number
      }
      calculate_prob_conversion_from_nurturing: {
        Args: { p_lead_id: string }
        Returns: number
      }
      check_auth_rate_limit: {
        Args: { p_identifier: string }
        Returns: boolean
      }
      check_auto_assignment_system: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit_enhanced: {
        Args: { p_identifier: string; p_action?: string }
        Returns: boolean
      }
      check_session_timeout: {
        Args: { p_user_id: string; p_timeout_minutes?: number }
        Returns: boolean
      }
      create_deal_from_won_lead: {
        Args: { p_lead_id: string; p_deal_value?: number }
        Returns: Json
      }
      create_lead_task: {
        Args: {
          p_lead_id: string
          p_title: string
          p_description?: string
          p_due_date?: string
          p_priority?: string
          p_assigned_to?: string
        }
        Returns: string
      }
      create_proposal_from_lead: {
        Args: { p_lead_id: string }
        Returns: string
      }
      create_qualification_task: {
        Args: { p_lead_id: string; p_assigned_to: string }
        Returns: string
      }
      create_reconversion_with_workflow: {
        Args: { reconversion_data: Json; user_id?: string }
        Returns: string
      }
      create_security_audit_trail: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_user_with_role_secure: {
        Args: {
          p_email: string
          p_password: string
          p_role: Database["public"]["Enums"]["app_role"]
          p_first_name?: string
          p_last_name?: string
        }
        Returns: Json
      }
      delete_user_completely: {
        Args: { _user_id: string }
        Returns: Json
      }
      diagnostico_net_queue: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      enforce_session_timeout: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      enhanced_log_security_event: {
        Args:
          | {
              p_event_type: string
              p_severity?: string
              p_description?: string
              p_metadata?: Json
            }
          | {
              p_event_type: string
              p_severity?: string
              p_description?: string
              p_metadata?: Json
              p_user_email?: string
            }
        Returns: string
      }
      estado_sistema_scoring: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      fn_recalcular_score_lead: {
        Args: { p_lead_id: string }
        Returns: undefined
      }
      get_all_overdue_tasks: {
        Args: Record<PropertyKey, never>
        Returns: {
          task_id: string
          task_title: string
          task_type: string
          entity_id: string
          entity_name: string
          due_date: string
          owner_id: string
          owner_email: string
          days_overdue: number
        }[]
      }
      get_current_user_role_safe: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_integraloop_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_quantum_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_security_setting: {
        Args: { p_key: string }
        Returns: string
      }
      get_user_highest_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          permission_name: string
          module: string
          action: string
        }[]
      }
      get_users_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          first_name: string
          last_name: string
          role: string
          is_manager: boolean
        }[]
      }
      has_permission: {
        Args: { _user_id: string; _permission_name: string }
        Returns: boolean
      }
      has_reconversion_permission: {
        Args: { p_reconversion_id: string; p_action?: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      has_role_secure: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      initiate_winback_sequence: {
        Args: { p_lead_id: string; p_sequence_id?: string }
        Returns: undefined
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_lead_score_change: {
        Args: {
          p_lead_id: string
          p_regla: string
          p_delta: number
          p_total: number
        }
        Returns: string
      }
      log_reconversion_audit: {
        Args: {
          p_reconversion_id: string
          p_action_type: string
          p_action_description: string
          p_old_data?: Json
          p_new_data?: Json
          p_severity?: string
          p_metadata?: Json
        }
        Returns: string
      }
      log_security_event: {
        Args:
          | {
              p_event_type: string
              p_severity: string
              p_description: string
              p_metadata?: Json
              p_user_id?: string
            }
          | {
              p_event_type: string
              p_severity?: string
              p_description?: string
              p_metadata?: Json
            }
        Returns: string
      }
      log_security_event_enhanced: {
        Args:
          | {
              p_event_type: string
              p_severity?: string
              p_description?: string
              p_metadata?: Json
              p_auto_alert?: boolean
            }
          | {
              p_event_type: string
              p_severity?: string
              p_description?: string
              p_metadata?: Json
              p_table_name?: string
            }
        Returns: string
      }
      mark_winback_response: {
        Args: { p_lead_id: string; p_response_type?: string }
        Returns: undefined
      }
      match_targets_for_reconversion: {
        Args: { reconversion_id: string }
        Returns: {
          target_count: number
          matched_companies: Json
        }[]
      }
      obtener_token_integraloop: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      process_inactive_leads: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      process_reconversion_closure: {
        Args: { reconversion_id: string; closure_data: Json; user_id?: string }
        Returns: boolean
      }
      recalcular_prob_conversion_lead: {
        Args: { p_lead_id: string }
        Returns: undefined
      }
      recalcular_todas_prob_conversion_winback: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      recalcular_todos_los_leads: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      remove_user_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: Json
      }
      sanitize_input: {
        Args: { p_input: string }
        Returns: string
      }
      sanitize_input_enhanced: {
        Args: { p_input: string; p_max_length?: number }
        Returns: string
      }
      sanitize_reconversion_data: {
        Args: { p_data: Json }
        Returns: Json
      }
      send_reconversion_notification: {
        Args: {
          p_reconversion_id: string
          p_notification_type: string
          p_recipient_user_id: string
          p_title: string
          p_message: string
          p_metadata?: Json
        }
        Returns: string
      }
      set_environment_variables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sincronizar_clientes_quantum: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sincronizar_cuentas_quantum: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sincronizar_cuentas_quantum_segura: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sincronizar_impuestos_quantum: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      test_auth_uid: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_lead_score: {
        Args: { p_lead_id: string; p_points_to_add: number }
        Returns: undefined
      }
      update_reconversion_subfase: {
        Args: {
          reconversion_id: string
          new_subfase: Database["public"]["Enums"]["reconversion_subfase"]
          user_id?: string
        }
        Returns: boolean
      }
      update_user_role_secure: {
        Args: {
          _target_user_id: string
          _new_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: Json
      }
      validate_and_sanitize_input: {
        Args: { p_input: string; p_max_length?: number; p_allow_html?: boolean }
        Returns: string
      }
      validate_api_configuration: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      validate_email_secure: {
        Args: { p_email: string }
        Returns: boolean
      }
      validate_input_security: {
        Args: { input_text: string }
        Returns: string
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: Json
      }
      validate_sensitive_data_access: {
        Args: { table_name: string; record_id: string; access_type?: string }
        Returns: boolean
      }
      validate_session_security: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_strong_password: {
        Args: { p_password: string }
        Returns: boolean
      }
      validate_user_input: {
        Args: { p_input: string; p_input_type?: string; p_max_length?: number }
        Returns: string
      }
    }
    Enums: {
      activity_type:
        | "EMAIL_SENT"
        | "EMAIL_OPENED"
        | "EMAIL_CLICKED"
        | "CALL_MADE"
        | "MEETING_SCHEDULED"
        | "FORM_SUBMITTED"
        | "WEBSITE_VISIT"
        | "DOCUMENT_DOWNLOADED"
        | "STAGE_CHANGED"
      app_role:
        | "superadmin"
        | "admin"
        | "user"
        | "manager"
        | "sales_rep"
        | "marketing"
        | "support"
      approval_stage: "loi" | "preliminary" | "final" | "closing"
      approval_type: "loi" | "contract" | "final_terms" | "closing"
      business_segment:
        | "pyme"
        | "mid_market"
        | "enterprise"
        | "family_office"
        | "investment_fund"
      collaborator_type:
        | "referente"
        | "partner_comercial"
        | "agente"
        | "freelancer"
      commission_status: "pending" | "paid" | "cancelled"
      company_size: "1-10" | "11-50" | "51-200" | "201-500" | "500+"
      company_status:
        | "activa"
        | "inactiva"
        | "prospecto"
        | "cliente"
        | "perdida"
      company_type:
        | "prospect"
        | "cliente"
        | "partner"
        | "franquicia"
        | "competidor"
        | "target"
        | "cliente_comprador"
        | "cliente_vendedor"
      contact_role:
        | "owner"
        | "buyer"
        | "advisor"
        | "investor"
        | "target"
        | "client"
        | "prospect"
        | "lead"
        | "other"
        | "decision_maker"
        | "influencer"
        | "gatekeeper"
        | "champion"
        | "ceo"
        | "cfo"
        | "board_member"
        | "broker"
      contact_status: "active" | "blocked" | "archived"
      ecosystem_role:
        | "entrepreneur"
        | "investor"
        | "advisor"
        | "broker"
        | "lawyer"
        | "banker"
      email_status: "SENT" | "OPENED" | "CLICKED"
      geographic_scope: "local" | "regional" | "nacional" | "internacional"
      interaction_type: "email" | "llamada" | "reunion" | "nota" | "task"
      lead_source:
        | "WEBSITE_FORM"
        | "CAPITAL_MARKET"
        | "REFERRAL"
        | "EMAIL_CAMPAIGN"
        | "SOCIAL_MEDIA"
        | "COLD_OUTREACH"
        | "EVENT"
        | "OTHER"
      lead_stage:
        | "CAPTURED"
        | "QUALIFIED"
        | "NURTURING"
        | "SALES_READY"
        | "CONVERTED"
        | "LOST"
      lead_status: "NEW" | "CONTACTED" | "QUALIFIED" | "DISQUALIFIED"
      lead_type: "compra" | "venta" | "general"
      lifecycle_stage:
        | "lead"
        | "marketing_qualified_lead"
        | "sales_qualified_lead"
        | "opportunity"
        | "customer"
        | "evangelist"
      mandate_relationship_status:
        | "potential"
        | "active"
        | "completed"
        | "discarded"
      mandate_relationship_type: "target" | "buyer" | "seller" | "advisor"
      nurturing_status: "ACTIVE" | "PAUSED" | "COMPLETED" | "FAILED"
      recipient_type: "collaborator" | "employee"
      reconversion_estado_type:
        | "activa"
        | "matching"
        | "negociando"
        | "cerrada"
        | "cancelada"
      reconversion_prioridad_type: "baja" | "media" | "alta" | "critica"
      reconversion_subfase: "prospecting" | "nda" | "loi" | "dd" | "signing"
      reconversion_subfase_type:
        | "prospecting"
        | "nda"
        | "loi"
        | "dd"
        | "signing"
        | "closed"
      target_status:
        | "IDENTIFIED"
        | "RESEARCHING"
        | "OUTREACH_PLANNED"
        | "CONTACTED"
        | "IN_CONVERSATION"
        | "ON_HOLD"
        | "ARCHIVED"
        | "CONVERTED_TO_DEAL"
      task_status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD"
      task_type:
        | "validation"
        | "document"
        | "review"
        | "closing"
        | "finance"
        | "communication"
        | "research"
        | "follow_up"
      transaction_interest: "compra" | "venta" | "ambos" | "ninguno"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "EMAIL_SENT",
        "EMAIL_OPENED",
        "EMAIL_CLICKED",
        "CALL_MADE",
        "MEETING_SCHEDULED",
        "FORM_SUBMITTED",
        "WEBSITE_VISIT",
        "DOCUMENT_DOWNLOADED",
        "STAGE_CHANGED",
      ],
      app_role: [
        "superadmin",
        "admin",
        "user",
        "manager",
        "sales_rep",
        "marketing",
        "support",
      ],
      approval_stage: ["loi", "preliminary", "final", "closing"],
      approval_type: ["loi", "contract", "final_terms", "closing"],
      business_segment: [
        "pyme",
        "mid_market",
        "enterprise",
        "family_office",
        "investment_fund",
      ],
      collaborator_type: [
        "referente",
        "partner_comercial",
        "agente",
        "freelancer",
      ],
      commission_status: ["pending", "paid", "cancelled"],
      company_size: ["1-10", "11-50", "51-200", "201-500", "500+"],
      company_status: ["activa", "inactiva", "prospecto", "cliente", "perdida"],
      company_type: [
        "prospect",
        "cliente",
        "partner",
        "franquicia",
        "competidor",
        "target",
        "cliente_comprador",
        "cliente_vendedor",
      ],
      contact_role: [
        "owner",
        "buyer",
        "advisor",
        "investor",
        "target",
        "client",
        "prospect",
        "lead",
        "other",
        "decision_maker",
        "influencer",
        "gatekeeper",
        "champion",
        "ceo",
        "cfo",
        "board_member",
        "broker",
      ],
      contact_status: ["active", "blocked", "archived"],
      ecosystem_role: [
        "entrepreneur",
        "investor",
        "advisor",
        "broker",
        "lawyer",
        "banker",
      ],
      email_status: ["SENT", "OPENED", "CLICKED"],
      geographic_scope: ["local", "regional", "nacional", "internacional"],
      interaction_type: ["email", "llamada", "reunion", "nota", "task"],
      lead_source: [
        "WEBSITE_FORM",
        "CAPITAL_MARKET",
        "REFERRAL",
        "EMAIL_CAMPAIGN",
        "SOCIAL_MEDIA",
        "COLD_OUTREACH",
        "EVENT",
        "OTHER",
      ],
      lead_stage: [
        "CAPTURED",
        "QUALIFIED",
        "NURTURING",
        "SALES_READY",
        "CONVERTED",
        "LOST",
      ],
      lead_status: ["NEW", "CONTACTED", "QUALIFIED", "DISQUALIFIED"],
      lead_type: ["compra", "venta", "general"],
      lifecycle_stage: [
        "lead",
        "marketing_qualified_lead",
        "sales_qualified_lead",
        "opportunity",
        "customer",
        "evangelist",
      ],
      mandate_relationship_status: [
        "potential",
        "active",
        "completed",
        "discarded",
      ],
      mandate_relationship_type: ["target", "buyer", "seller", "advisor"],
      nurturing_status: ["ACTIVE", "PAUSED", "COMPLETED", "FAILED"],
      recipient_type: ["collaborator", "employee"],
      reconversion_estado_type: [
        "activa",
        "matching",
        "negociando",
        "cerrada",
        "cancelada",
      ],
      reconversion_prioridad_type: ["baja", "media", "alta", "critica"],
      reconversion_subfase: ["prospecting", "nda", "loi", "dd", "signing"],
      reconversion_subfase_type: [
        "prospecting",
        "nda",
        "loi",
        "dd",
        "signing",
        "closed",
      ],
      target_status: [
        "IDENTIFIED",
        "RESEARCHING",
        "OUTREACH_PLANNED",
        "CONTACTED",
        "IN_CONVERSATION",
        "ON_HOLD",
        "ARCHIVED",
        "CONVERTED_TO_DEAL",
      ],
      task_status: ["PENDING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"],
      task_type: [
        "validation",
        "document",
        "review",
        "closing",
        "finance",
        "communication",
        "research",
        "follow_up",
      ],
      transaction_interest: ["compra", "venta", "ambos", "ninguno"],
    },
  },
} as const
