export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
            foreignKeyName: "cases_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
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
      collaborator_commissions: {
        Row: {
          collaborator_id: string
          commission_amount: number
          commission_percentage: number | null
          created_at: string
          deal_id: string | null
          id: string
          lead_id: string | null
          notes: string | null
          paid_at: string | null
          status: Database["public"]["Enums"]["commission_status"]
          updated_at: string
        }
        Insert: {
          collaborator_id: string
          commission_amount: number
          commission_percentage?: number | null
          created_at?: string
          deal_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Update: {
          collaborator_id?: string
          commission_amount?: number
          commission_percentage?: number | null
          created_at?: string
          deal_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          paid_at?: string | null
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
            foreignKeyName: "collaborator_commissions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
          city: string | null
          company_size: Database["public"]["Enums"]["company_size"]
          company_status: Database["public"]["Enums"]["company_status"]
          company_type: Database["public"]["Enums"]["company_type"]
          country: string | null
          created_at: string
          created_by: string | null
          description: string | null
          domain: string | null
          engagement_score: number | null
          facebook_url: string | null
          first_contact_date: string | null
          founded_year: number | null
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
          next_follow_up_date: string | null
          notes: string | null
          owner_id: string | null
          owner_name: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          tags: string[] | null
          twitter_url: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          company_size?: Database["public"]["Enums"]["company_size"]
          company_status?: Database["public"]["Enums"]["company_status"]
          company_type?: Database["public"]["Enums"]["company_type"]
          country?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain?: string | null
          engagement_score?: number | null
          facebook_url?: string | null
          first_contact_date?: string | null
          founded_year?: number | null
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
          next_follow_up_date?: string | null
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tags?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          company_size?: Database["public"]["Enums"]["company_size"]
          company_status?: Database["public"]["Enums"]["company_status"]
          company_type?: Database["public"]["Enums"]["company_type"]
          country?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain?: string | null
          engagement_score?: number | null
          facebook_url?: string | null
          first_contact_date?: string | null
          founded_year?: number | null
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
          next_follow_up_date?: string | null
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tags?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
        ]
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
      contacts: {
        Row: {
          company: string | null
          company_id: string | null
          contact_priority: string | null
          contact_source: string | null
          contact_type: string
          created_at: string
          created_by: string | null
          deal_preferences: Json | null
          email: string | null
          id: string
          investment_capacity_max: number | null
          investment_capacity_min: number | null
          is_active: boolean | null
          language_preference: string | null
          last_interaction_date: string | null
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          preferred_contact_method: string | null
          sectors_of_interest: string[] | null
          time_zone: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          company?: string | null
          company_id?: string | null
          contact_priority?: string | null
          contact_source?: string | null
          contact_type?: string
          created_at?: string
          created_by?: string | null
          deal_preferences?: Json | null
          email?: string | null
          id?: string
          investment_capacity_max?: number | null
          investment_capacity_min?: number | null
          is_active?: boolean | null
          language_preference?: string | null
          last_interaction_date?: string | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          preferred_contact_method?: string | null
          sectors_of_interest?: string[] | null
          time_zone?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          company?: string | null
          company_id?: string | null
          contact_priority?: string | null
          contact_source?: string | null
          contact_type?: string
          created_at?: string
          created_by?: string | null
          deal_preferences?: Json | null
          email?: string | null
          id?: string
          investment_capacity_max?: number | null
          investment_capacity_min?: number | null
          is_active?: boolean | null
          language_preference?: string | null
          last_interaction_date?: string | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          preferred_contact_method?: string | null
          sectors_of_interest?: string[] | null
          time_zone?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
        Relationships: [
          {
            foreignKeyName: "info_memos_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
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
      lead_scoring_rules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          points_awarded: number
          trigger_condition: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          points_awarded: number
          trigger_condition: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          points_awarded?: number
          trigger_condition?: Json
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to_id: string | null
          collaborator_id: string | null
          company_name: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          source: string
          stage_id: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_to_id?: string | null
          collaborator_id?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          source: string
          stage_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_to_id?: string | null
          collaborator_id?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          source?: string
          stage_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
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
            foreignKeyName: "leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
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
        Relationships: [
          {
            foreignKeyName: "ndas_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
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
            foreignKeyName: "negocios_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
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
          id: string
          location: string | null
          manager_id: string | null
          operation_type: string
          photo_url: string | null
          project_name: string | null
          revenue: number | null
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
          id?: string
          location?: string | null
          manager_id?: string | null
          operation_type: string
          photo_url?: string | null
          project_name?: string | null
          revenue?: number | null
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
          id?: string
          location?: string | null
          manager_id?: string | null
          operation_type?: string
          photo_url?: string | null
          project_name?: string | null
          revenue?: number | null
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
            foreignKeyName: "proposals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
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
            foreignKeyName: "recurring_fees_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
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
            foreignKeyName: "teasers_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
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
            foreignKeyName: "tracked_emails_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
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
      transactions: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          estimated_value: number | null
          expected_closing_date: string | null
          id: string
          notes: string | null
          priority: string | null
          proposal_id: string
          status: string
          transaction_code: string | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          estimated_value?: number | null
          expected_closing_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          proposal_id: string
          status?: string
          transaction_code?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          estimated_value?: number | null
          expected_closing_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          proposal_id?: string
          status?: string
          transaction_code?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
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
      user_profiles: {
        Row: {
          company: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      diagnostico_net_queue: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_highest_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_users_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          role: Database["public"]["Enums"]["app_role"]
          first_name: string
          last_name: string
          company: string
          phone: string
          is_manager: boolean
          manager_name: string
          manager_position: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      obtener_token_integraloop: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sincronizar_clientes_quantum: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sincronizar_cuentas_quantum: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sincronizar_cuentas_quantum_final: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sincronizar_empresas_quantum: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sincronizar_impuestos_quantum: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sincronizar_proveedores_quantum: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_lead_score: {
        Args: { p_lead_id: string; p_points_to_add: number }
        Returns: undefined
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
      app_role: "superadmin" | "admin" | "user"
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
      email_status: "SENT" | "OPENED" | "CLICKED"
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
      lifecycle_stage:
        | "lead"
        | "marketing_qualified_lead"
        | "sales_qualified_lead"
        | "opportunity"
        | "customer"
        | "evangelist"
      nurturing_status: "ACTIVE" | "PAUSED" | "COMPLETED" | "FAILED"
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      ],
      app_role: ["superadmin", "admin", "user"],
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
      ],
      email_status: ["SENT", "OPENED", "CLICKED"],
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
      lifecycle_stage: [
        "lead",
        "marketing_qualified_lead",
        "sales_qualified_lead",
        "opportunity",
        "customer",
        "evangelist",
      ],
      nurturing_status: ["ACTIVE", "PAUSED", "COMPLETED", "FAILED"],
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
    },
  },
} as const
