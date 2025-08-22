export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_categories: {
        Row: {
          color: string | null
          created_at: string
          default_hourly_rate: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_billable_by_default: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          default_hourly_rate?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_billable_by_default?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          default_hourly_rate?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_billable_by_default?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_suggestions: {
        Row: {
          confidence_score: number | null
          context_entity_id: string | null
          context_entity_type: string | null
          id: string
          responded_at: string | null
          status: string | null
          suggested_activity: string
          suggested_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          context_entity_id?: string | null
          context_entity_type?: string | null
          id?: string
          responded_at?: string | null
          status?: string | null
          suggested_activity: string
          suggested_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          context_entity_id?: string | null
          context_entity_type?: string | null
          id?: string
          responded_at?: string | null
          status?: string | null
          suggested_activity?: string
          suggested_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      automated_followups: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          proposal_id: string
          recipient_email: string
          rule_id: string | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
          subject: string | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          proposal_id: string
          recipient_email: string
          rule_id?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          proposal_id?: string
          recipient_email?: string
          rule_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automated_followups_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_followups_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_followups_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          action_data: Json | null
          action_taken: string
          automation_type: string
          created_at: string
          entity_id: string
          entity_type: string
          error_message: string | null
          executed_at: string
          execution_time_ms: number | null
          id: string
          status: string
          trigger_event: string
          user_id: string | null
        }
        Insert: {
          action_data?: Json | null
          action_taken: string
          automation_type: string
          created_at?: string
          entity_id: string
          entity_type: string
          error_message?: string | null
          executed_at?: string
          execution_time_ms?: number | null
          id?: string
          status?: string
          trigger_event: string
          user_id?: string | null
        }
        Update: {
          action_data?: Json | null
          action_taken?: string
          automation_type?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          executed_at?: string
          execution_time_ms?: number | null
          id?: string
          status?: string
          trigger_event?: string
          user_id?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          actions: Json | null
          conditions: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          priority: number | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          priority?: number | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          priority?: number | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      availability_patterns: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          pattern_data: Json
          pattern_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          pattern_data: Json
          pattern_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          pattern_data?: Json
          pattern_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      booking_links: {
        Row: {
          advance_notice_hours: number | null
          availability_schedule: Json
          booking_limit_per_day: number | null
          buffer_time_after: number | null
          buffer_time_before: number | null
          confirmation_message: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          max_advance_days: number | null
          meeting_location: string | null
          questions: Json | null
          redirect_url: string | null
          requires_approval: boolean | null
          slug: string
          title: string
          updated_at: string | null
          user_id: string
          video_meeting_enabled: boolean | null
        }
        Insert: {
          advance_notice_hours?: number | null
          availability_schedule?: Json
          booking_limit_per_day?: number | null
          buffer_time_after?: number | null
          buffer_time_before?: number | null
          confirmation_message?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          max_advance_days?: number | null
          meeting_location?: string | null
          questions?: Json | null
          redirect_url?: string | null
          requires_approval?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
          user_id: string
          video_meeting_enabled?: boolean | null
        }
        Update: {
          advance_notice_hours?: number | null
          availability_schedule?: Json
          booking_limit_per_day?: number | null
          buffer_time_after?: number | null
          buffer_time_before?: number | null
          confirmation_message?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          max_advance_days?: number | null
          meeting_location?: string | null
          questions?: Json | null
          redirect_url?: string | null
          requires_approval?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          video_meeting_enabled?: boolean | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          answers: Json | null
          booker_email: string
          booker_name: string
          booker_phone: string | null
          booking_link_id: string
          booking_notes: string | null
          cancelled_at: string | null
          cancelled_reason: string | null
          company_name: string | null
          confirmation_token: string | null
          created_at: string | null
          event_id: string | null
          id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          answers?: Json | null
          booker_email: string
          booker_name: string
          booker_phone?: string | null
          booking_link_id: string
          booking_notes?: string | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          company_name?: string | null
          confirmation_token?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          answers?: Json | null
          booker_email?: string
          booker_name?: string
          booker_phone?: string | null
          booking_link_id?: string
          booking_notes?: string | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          company_name?: string | null
          confirmation_token?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_booking_link_id_fkey"
            columns: ["booking_link_id"]
            isOneToOne: false
            referencedRelation: "booking_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
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
      calendar_analytics: {
        Row: {
          created_at: string | null
          deal_progression: boolean | null
          duration_minutes: number | null
          event_id: string | null
          follow_up_created: boolean | null
          id: string
          meeting_type: string | null
          metric_date: string
          metric_type: string
          outcome: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deal_progression?: boolean | null
          duration_minutes?: number | null
          event_id?: string | null
          follow_up_created?: boolean | null
          id?: string
          meeting_type?: string | null
          metric_date?: string
          metric_type: string
          outcome?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deal_progression?: boolean | null
          duration_minutes?: number | null
          event_id?: string | null
          follow_up_created?: boolean | null
          id?: string
          meeting_type?: string | null
          metric_date?: string
          metric_type?: string
          outcome?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_analytics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          attendees: Json | null
          booking_link_id: string | null
          calendar_provider: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          end_date: string
          event_type: string
          external_event_id: string | null
          follow_up_required: boolean | null
          id: string
          is_all_day: boolean | null
          is_recurring: boolean | null
          lead_id: string | null
          location: string | null
          mandate_id: string | null
          meeting_outcome: string | null
          meeting_type: string | null
          preparation_notes: string | null
          priority: string | null
          recurrence_rule: string | null
          reminder_minutes: number | null
          start_date: string
          status: string
          time_zone: string | null
          title: string
          travel_time_minutes: number | null
          updated_at: string
          user_id: string
          video_meeting_url: string | null
          visibility: string | null
        }
        Insert: {
          attendees?: Json | null
          booking_link_id?: string | null
          calendar_provider?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          end_date: string
          event_type?: string
          external_event_id?: string | null
          follow_up_required?: boolean | null
          id?: string
          is_all_day?: boolean | null
          is_recurring?: boolean | null
          lead_id?: string | null
          location?: string | null
          mandate_id?: string | null
          meeting_outcome?: string | null
          meeting_type?: string | null
          preparation_notes?: string | null
          priority?: string | null
          recurrence_rule?: string | null
          reminder_minutes?: number | null
          start_date: string
          status?: string
          time_zone?: string | null
          title: string
          travel_time_minutes?: number | null
          updated_at?: string
          user_id: string
          video_meeting_url?: string | null
          visibility?: string | null
        }
        Update: {
          attendees?: Json | null
          booking_link_id?: string | null
          calendar_provider?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          end_date?: string
          event_type?: string
          external_event_id?: string | null
          follow_up_required?: boolean | null
          id?: string
          is_all_day?: boolean | null
          is_recurring?: boolean | null
          lead_id?: string | null
          location?: string | null
          mandate_id?: string | null
          meeting_outcome?: string | null
          meeting_type?: string | null
          preparation_notes?: string | null
          priority?: string | null
          recurrence_rule?: string | null
          reminder_minutes?: number | null
          start_date?: string
          status?: string
          time_zone?: string | null
          title?: string
          travel_time_minutes?: number | null
          updated_at?: string
          user_id?: string
          video_meeting_url?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          account_email: string
          calendar_id: string | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          provider: string
          refresh_token: string | null
          sync_enabled: boolean | null
          sync_error: string | null
          sync_status: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_email: string
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          sync_error?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_email?: string
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          sync_error?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaign_ab_tests: {
        Row: {
          campaign_id: string | null
          completed_at: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          split_percentage: number | null
          test_name: string
          variant_a: Json
          variant_b: Json
          winner_variant: string | null
        }
        Insert: {
          campaign_id?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          split_percentage?: number | null
          test_name: string
          variant_a: Json
          variant_b: Json
          winner_variant?: string | null
        }
        Update: {
          campaign_id?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          split_percentage?: number | null
          test_name?: string
          variant_a?: Json
          variant_b?: Json
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_ab_tests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_analytics: {
        Row: {
          campaign_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          subscriber_id: string | null
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          campaign_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          subscriber_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          subscriber_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_analytics_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_workflows: {
        Row: {
          campaign_template: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          campaign_template?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          campaign_template?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          ab_test_id: string | null
          audience: string
          automation_workflow_id: string | null
          campaign_type: string | null
          created_at: string
          created_by: string | null
          html_body: string
          id: string
          opportunity_ids: string[]
          performance_metrics: Json | null
          send_schedule: Json | null
          sent_at: string
          subject: string
          targeting_config: Json | null
          template_id: string | null
        }
        Insert: {
          ab_test_id?: string | null
          audience?: string
          automation_workflow_id?: string | null
          campaign_type?: string | null
          created_at?: string
          created_by?: string | null
          html_body: string
          id?: string
          opportunity_ids?: string[]
          performance_metrics?: Json | null
          send_schedule?: Json | null
          sent_at?: string
          subject: string
          targeting_config?: Json | null
          template_id?: string | null
        }
        Update: {
          ab_test_id?: string | null
          audience?: string
          automation_workflow_id?: string | null
          campaign_type?: string | null
          created_at?: string
          created_by?: string | null
          html_body?: string
          id?: string
          opportunity_ids?: string[]
          performance_metrics?: Json | null
          send_schedule?: Json | null
          sent_at?: string
          subject?: string
          targeting_config?: Json | null
          template_id?: string | null
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
      collaborator_performance: {
        Row: {
          collaborator_id: string | null
          conversion_rate: number | null
          created_at: string | null
          deals_closed: number | null
          id: string
          leads_generated: number | null
          performance_score: number | null
          period_end: string
          period_start: string
          ranking_position: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          collaborator_id?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          deals_closed?: number | null
          id?: string
          leads_generated?: number | null
          performance_score?: number | null
          period_end: string
          period_start: string
          ranking_position?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          collaborator_id?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          deals_closed?: number | null
          id?: string
          leads_generated?: number | null
          performance_score?: number | null
          period_end?: string
          period_start?: string
          ranking_position?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborator_performance_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborator_territories: {
        Row: {
          assignment_type: string | null
          collaborator_id: string | null
          created_at: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          territory_id: string | null
        }
        Insert: {
          assignment_type?: string | null
          collaborator_id?: string | null
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          territory_id?: string | null
        }
        Update: {
          assignment_type?: string | null
          collaborator_id?: string | null
          created_at?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          territory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborator_territories_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborator_territories_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
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
      commission_calculations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          base_amount: number
          calculated_amount: number
          calculation_details: Json | null
          calculation_type: string
          collaborator_id: string | null
          commission_rate: number
          created_at: string | null
          deal_id: string | null
          id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          base_amount: number
          calculated_amount: number
          calculation_details?: Json | null
          calculation_type?: string
          collaborator_id?: string | null
          commission_rate: number
          created_at?: string | null
          deal_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          base_amount?: number
          calculated_amount?: number
          calculation_details?: Json | null
          calculation_type?: string
          collaborator_id?: string | null
          commission_rate?: number
          created_at?: string | null
          deal_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_calculations_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_escrow: {
        Row: {
          commission_id: string | null
          created_at: string | null
          escrow_amount: number
          expected_release_date: string | null
          hold_reason: string | null
          id: string
          release_conditions: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          commission_id?: string | null
          created_at?: string | null
          escrow_amount: number
          expected_release_date?: string | null
          hold_reason?: string | null
          id?: string
          release_conditions?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          commission_id?: string | null
          created_at?: string | null
          escrow_amount?: number
          expected_release_date?: string | null
          hold_reason?: string | null
          id?: string
          release_conditions?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_escrow_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "commission_calculations"
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
          buyer_active: boolean
          city: string | null
          company_size: Database["public"]["Enums"]["company_size"]
          company_status: Database["public"]["Enums"]["company_status"]
          company_type: Database["public"]["Enums"]["company_type"]
          completeness_score: number | null
          country: string | null
          country_code: string | null
          created_at: string
          created_by: string | null
          deal_readiness_score: number | null
          description: string | null
          domain: string | null
          ebitda_band: string | null
          employees_band: string | null
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
          industry_tax: string | null
          investor_type: string | null
          is_franquicia: boolean
          is_key_account: boolean
          is_target_account: boolean
          last_activity_date: string | null
          last_contact_date: string | null
          lead_score: number | null
          leverage_band: string | null
          lifecycle_stage: Database["public"]["Enums"]["lifecycle_stage"]
          linkedin_url: string | null
          margin_band: string | null
          name: string
          name_normalized: string | null
          network_strength: number | null
          next_follow_up_date: string | null
          nif: string | null
          notes: string | null
          owner_id: string | null
          owner_name: string | null
          phone: string | null
          postal_code: string | null
          prefers_email: boolean
          prefers_phone: boolean
          prefers_whatsapp: boolean
          region: string | null
          revenue_band: string | null
          seller_ready: boolean
          source_table: string | null
          state: string | null
          strategic_fit: string | null
          subindustry_tax: string | null
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
          buyer_active?: boolean
          city?: string | null
          company_size?: Database["public"]["Enums"]["company_size"]
          company_status?: Database["public"]["Enums"]["company_status"]
          company_type?: Database["public"]["Enums"]["company_type"]
          completeness_score?: number | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          deal_readiness_score?: number | null
          description?: string | null
          domain?: string | null
          ebitda_band?: string | null
          employees_band?: string | null
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
          industry_tax?: string | null
          investor_type?: string | null
          is_franquicia?: boolean
          is_key_account?: boolean
          is_target_account?: boolean
          last_activity_date?: string | null
          last_contact_date?: string | null
          lead_score?: number | null
          leverage_band?: string | null
          lifecycle_stage?: Database["public"]["Enums"]["lifecycle_stage"]
          linkedin_url?: string | null
          margin_band?: string | null
          name: string
          name_normalized?: string | null
          network_strength?: number | null
          next_follow_up_date?: string | null
          nif?: string | null
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          phone?: string | null
          postal_code?: string | null
          prefers_email?: boolean
          prefers_phone?: boolean
          prefers_whatsapp?: boolean
          region?: string | null
          revenue_band?: string | null
          seller_ready?: boolean
          source_table?: string | null
          state?: string | null
          strategic_fit?: string | null
          subindustry_tax?: string | null
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
          buyer_active?: boolean
          city?: string | null
          company_size?: Database["public"]["Enums"]["company_size"]
          company_status?: Database["public"]["Enums"]["company_status"]
          company_type?: Database["public"]["Enums"]["company_type"]
          completeness_score?: number | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          deal_readiness_score?: number | null
          description?: string | null
          domain?: string | null
          ebitda_band?: string | null
          employees_band?: string | null
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
          industry_tax?: string | null
          investor_type?: string | null
          is_franquicia?: boolean
          is_key_account?: boolean
          is_target_account?: boolean
          last_activity_date?: string | null
          last_contact_date?: string | null
          lead_score?: number | null
          leverage_band?: string | null
          lifecycle_stage?: Database["public"]["Enums"]["lifecycle_stage"]
          linkedin_url?: string | null
          margin_band?: string | null
          name?: string
          name_normalized?: string | null
          network_strength?: number | null
          next_follow_up_date?: string | null
          nif?: string | null
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          phone?: string | null
          postal_code?: string | null
          prefers_email?: boolean
          prefers_phone?: boolean
          prefers_whatsapp?: boolean
          region?: string | null
          revenue_band?: string | null
          seller_ready?: boolean
          source_table?: string | null
          state?: string | null
          strategic_fit?: string | null
          subindustry_tax?: string | null
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
          channel_pref: string | null
          classification: string | null
          collaborator_id: string | null
          company: string | null
          company_id: string | null
          completeness_score: number | null
          consent_email: boolean
          consent_whatsapp: boolean
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
          email_domain: string | null
          email_opens: number | null
          engagement_level: number | null
          external_id: string | null
          external_lead_id: string | null
          external_source: string | null
          first_contact_date: string | null
          first_name: string | null
          follow_up_count: number | null
          geography_focus: string[] | null
          id: string
          interest: string | null
          investment_capacity_max: number | null
          investment_capacity_min: number | null
          is_active: boolean | null
          language_preference: string | null
          last_activity_date: string | null
          last_contact_date: string | null
          last_interaction_date: string | null
          last_name: string | null
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
          phone_normalized: string | null
          position: string | null
          preferred_contact_method: string | null
          role_simple: string | null
          roles: string[] | null
          sectors_focus: string[] | null
          sectors_of_interest: string[] | null
          source_table: string | null
          stage_id: string | null
          tags_array: string[] | null
          ticket_max: number | null
          ticket_min: number | null
          time_zone: string | null
          updated_at: string
          website_url: string | null
          website_visits: number | null
        }
        Insert: {
          assigned_to_id?: string | null
          channel_pref?: string | null
          classification?: string | null
          collaborator_id?: string | null
          company?: string | null
          company_id?: string | null
          completeness_score?: number | null
          consent_email?: boolean
          consent_whatsapp?: boolean
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
          email_domain?: string | null
          email_opens?: number | null
          engagement_level?: number | null
          external_id?: string | null
          external_lead_id?: string | null
          external_source?: string | null
          first_contact_date?: string | null
          first_name?: string | null
          follow_up_count?: number | null
          geography_focus?: string[] | null
          id?: string
          interest?: string | null
          investment_capacity_max?: number | null
          investment_capacity_min?: number | null
          is_active?: boolean | null
          language_preference?: string | null
          last_activity_date?: string | null
          last_contact_date?: string | null
          last_interaction_date?: string | null
          last_name?: string | null
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
          phone_normalized?: string | null
          position?: string | null
          preferred_contact_method?: string | null
          role_simple?: string | null
          roles?: string[] | null
          sectors_focus?: string[] | null
          sectors_of_interest?: string[] | null
          source_table?: string | null
          stage_id?: string | null
          tags_array?: string[] | null
          ticket_max?: number | null
          ticket_min?: number | null
          time_zone?: string | null
          updated_at?: string
          website_url?: string | null
          website_visits?: number | null
        }
        Update: {
          assigned_to_id?: string | null
          channel_pref?: string | null
          classification?: string | null
          collaborator_id?: string | null
          company?: string | null
          company_id?: string | null
          completeness_score?: number | null
          consent_email?: boolean
          consent_whatsapp?: boolean
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
          email_domain?: string | null
          email_opens?: number | null
          engagement_level?: number | null
          external_id?: string | null
          external_lead_id?: string | null
          external_source?: string | null
          first_contact_date?: string | null
          first_name?: string | null
          follow_up_count?: number | null
          geography_focus?: string[] | null
          id?: string
          interest?: string | null
          investment_capacity_max?: number | null
          investment_capacity_min?: number | null
          is_active?: boolean | null
          language_preference?: string | null
          last_activity_date?: string | null
          last_contact_date?: string | null
          last_interaction_date?: string | null
          last_name?: string | null
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
          phone_normalized?: string | null
          position?: string | null
          preferred_contact_method?: string | null
          role_simple?: string | null
          roles?: string[] | null
          sectors_focus?: string[] | null
          sectors_of_interest?: string[] | null
          source_table?: string | null
          stage_id?: string | null
          tags_array?: string[] | null
          ticket_max?: number | null
          ticket_min?: number | null
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
      crm_inbound_leads: {
        Row: {
          cif: string | null
          company_id: string | null
          company_name: string | null
          contact_id: string | null
          contact_name: string | null
          created_at: string
          dedupe_key: string | null
          ebitda: number | null
          ebitda_multiple_used: number | null
          email: string | null
          employee_range: string | null
          final_valuation: number | null
          id: string
          industry: string | null
          intent: string
          lead_id: string | null
          location: string | null
          payload: Json | null
          phone: string | null
          processed_at: string | null
          processing_error: string | null
          processing_status: string
          revenue: number | null
          source: string | null
          status: string | null
          utm: Json | null
          valuation_range_max: number | null
          valuation_range_min: number | null
          visitor_id: string | null
          years_of_operation: number | null
        }
        Insert: {
          cif?: string | null
          company_id?: string | null
          company_name?: string | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string
          dedupe_key?: string | null
          ebitda?: number | null
          ebitda_multiple_used?: number | null
          email?: string | null
          employee_range?: string | null
          final_valuation?: number | null
          id?: string
          industry?: string | null
          intent: string
          lead_id?: string | null
          location?: string | null
          payload?: Json | null
          phone?: string | null
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string
          revenue?: number | null
          source?: string | null
          status?: string | null
          utm?: Json | null
          valuation_range_max?: number | null
          valuation_range_min?: number | null
          visitor_id?: string | null
          years_of_operation?: number | null
        }
        Update: {
          cif?: string | null
          company_id?: string | null
          company_name?: string | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string
          dedupe_key?: string | null
          ebitda?: number | null
          ebitda_multiple_used?: number | null
          email?: string | null
          employee_range?: string | null
          final_valuation?: number | null
          id?: string
          industry?: string | null
          intent?: string
          lead_id?: string | null
          location?: string | null
          payload?: Json | null
          phone?: string | null
          processed_at?: string | null
          processing_error?: string | null
          processing_status?: string
          revenue?: number | null
          source?: string | null
          status?: string | null
          utm?: Json | null
          valuation_range_max?: number | null
          valuation_range_min?: number | null
          visitor_id?: string | null
          years_of_operation?: number | null
        }
        Relationships: []
      }
      crm_integrations: {
        Row: {
          configuration: Json
          created_at: string
          error_message: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          name: string
          provider: string
          sync_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name: string
          provider: string
          sync_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name?: string
          provider?: string
          sync_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_leads: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          lead_type: string
          payload: Json | null
          phone: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          lead_type: string
          payload?: Json | null
          phone?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          lead_type?: string
          payload?: Json | null
          phone?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
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
      dd: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
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
          metadata: Json | null
          session_duration: number | null
          share_id: string | null
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
          metadata?: Json | null
          session_duration?: number | null
          share_id?: string | null
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
          metadata?: Json | null
          session_duration?: number | null
          share_id?: string | null
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
          {
            foreignKeyName: "document_access_logs_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "document_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      document_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string
          comments: string | null
          created_at: string
          document_id: string
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["approval_status"] | null
          step_number: number
          updated_at: string
          workflow_instance_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id: string
          comments?: string | null
          created_at?: string
          document_id: string
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["approval_status"] | null
          step_number: number
          updated_at?: string
          workflow_instance_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string
          comments?: string | null
          created_at?: string
          document_id?: string
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["approval_status"] | null
          step_number?: number
          updated_at?: string
          workflow_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_approvals_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_approvals_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "document_workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      document_comments: {
        Row: {
          content: string
          created_at: string
          created_by: string
          document_id: string
          id: string
          position_data: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          thread_id: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          document_id: string
          id?: string
          position_data?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          thread_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          document_id?: string
          id?: string
          position_data?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          thread_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "document_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      document_folders: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          folder_type: string | null
          id: string
          metadata: Json | null
          name: string
          parent_folder_id: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          folder_type?: string | null
          id?: string
          metadata?: Json | null
          name: string
          parent_folder_id?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          folder_type?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          parent_folder_id?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_folders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      document_mentions: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          mentioned_user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          mentioned_user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          mentioned_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_mentions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "document_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      document_notifications: {
        Row: {
          comment_id: string | null
          created_at: string
          document_id: string | null
          id: string
          message: string
          notification_type: string
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          message: string
          notification_type: string
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          message?: string
          notification_type?: string
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "document_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_notifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_permissions: {
        Row: {
          created_at: string | null
          document_id: string
          expires_at: string | null
          granted_at: string | null
          granted_by: string
          id: string
          permission_type: string
          team_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_id: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by: string
          id?: string
          permission_type: string
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string
          id?: string
          permission_type?: string
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_permissions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_permissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      document_presence: {
        Row: {
          created_at: string
          cursor_position: Json | null
          document_id: string
          id: string
          last_seen: string
          selection_data: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          cursor_position?: Json | null
          document_id: string
          id?: string
          last_seen?: string
          selection_data?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          cursor_position?: Json | null
          document_id?: string
          id?: string
          last_seen?: string
          selection_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_presence_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_shares: {
        Row: {
          created_at: string | null
          created_by: string
          current_views: number | null
          document_id: string
          download_allowed: boolean | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_views: number | null
          metadata: Json | null
          password_hash: string | null
          print_allowed: boolean | null
          share_token: string
          share_type: string | null
          updated_at: string | null
          watermark_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_views?: number | null
          document_id: string
          download_allowed?: boolean | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_views?: number | null
          metadata?: Json | null
          password_hash?: string | null
          print_allowed?: boolean | null
          share_token?: string
          share_type?: string | null
          updated_at?: string | null
          watermark_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_views?: number | null
          document_id?: string
          download_allowed?: boolean | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_views?: number | null
          metadata?: Json | null
          password_hash?: string | null
          print_allowed?: boolean | null
          share_token?: string
          share_type?: string | null
          updated_at?: string | null
          watermark_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "document_shares_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_status_history: {
        Row: {
          changed_by: string
          created_at: string
          document_id: string
          id: string
          metadata: Json | null
          new_status: string
          previous_status: string | null
          reason: string | null
        }
        Insert: {
          changed_by: string
          created_at?: string
          document_id: string
          id?: string
          metadata?: Json | null
          new_status: string
          previous_status?: string | null
          reason?: string | null
        }
        Update: {
          changed_by?: string
          created_at?: string
          document_id?: string
          id?: string
          metadata?: Json | null
          new_status?: string
          previous_status?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_status_history_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
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
      document_versions: {
        Row: {
          changes_summary: string | null
          content: Json
          created_at: string | null
          created_by: string | null
          document_id: string | null
          id: string
          title: string
          version_number: number
        }
        Insert: {
          changes_summary?: string | null
          content: Json
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          id?: string
          title: string
          version_number: number
        }
        Update: {
          changes_summary?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          id?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_workflow_instances: {
        Row: {
          completed_at: string | null
          current_step: number | null
          document_id: string
          id: string
          metadata: Json | null
          started_at: string
          started_by: string
          status: string | null
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number | null
          document_id: string
          id?: string
          metadata?: Json | null
          started_at?: string
          started_by: string
          status?: string | null
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number | null
          document_id?: string
          id?: string
          metadata?: Json | null
          started_at?: string
          started_by?: string
          status?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_workflow_instances_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_workflow_instances_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "document_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      document_workflows: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          workflow_steps: Json
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          workflow_steps?: Json
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          workflow_steps?: Json
        }
        Relationships: []
      }
      documents: {
        Row: {
          auto_linked_entity_id: string | null
          auto_linked_entity_type: string | null
          content: Json
          created_at: string
          created_by: string | null
          current_version: number | null
          document_type: string
          expiration_date: string | null
          folder_id: string | null
          id: string
          metadata: Json | null
          published_at: string | null
          status: string
          tags: string[] | null
          template_id: string | null
          title: string
          updated_at: string
          variables: Json | null
          watermark_settings: Json | null
        }
        Insert: {
          auto_linked_entity_id?: string | null
          auto_linked_entity_type?: string | null
          content?: Json
          created_at?: string
          created_by?: string | null
          current_version?: number | null
          document_type?: string
          expiration_date?: string | null
          folder_id?: string | null
          id?: string
          metadata?: Json | null
          published_at?: string | null
          status?: string
          tags?: string[] | null
          template_id?: string | null
          title: string
          updated_at?: string
          variables?: Json | null
          watermark_settings?: Json | null
        }
        Update: {
          auto_linked_entity_id?: string | null
          auto_linked_entity_type?: string | null
          content?: Json
          created_at?: string
          created_by?: string | null
          current_version?: number | null
          document_type?: string
          expiration_date?: string | null
          folder_id?: string | null
          id?: string
          metadata?: Json | null
          published_at?: string | null
          status?: string
          tags?: string[] | null
          template_id?: string | null
          title?: string
          updated_at?: string
          variables?: Json | null
          watermark_settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      einforma_alerts: {
        Row: {
          alert_data: Json | null
          alert_type: string
          company_id: string | null
          created_at: string
          id: string
          is_read: boolean
          is_resolved: boolean
          message: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          alert_data?: Json | null
          alert_type: string
          company_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          is_resolved?: boolean
          message: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          alert_data?: Json | null
          alert_type?: string
          company_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          is_resolved?: boolean
          message?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "einforma_alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "einforma_alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "einforma_alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      einforma_analytics: {
        Row: {
          additional_data: Json | null
          company_sector: string | null
          created_at: string
          id: string
          metric_date: string
          metric_type: string
          metric_value: number
          user_id: string | null
        }
        Insert: {
          additional_data?: Json | null
          company_sector?: string | null
          created_at?: string
          id?: string
          metric_date?: string
          metric_type: string
          metric_value: number
          user_id?: string | null
        }
        Update: {
          additional_data?: Json | null
          company_sector?: string | null
          created_at?: string
          id?: string
          metric_date?: string
          metric_type?: string
          metric_value?: number
          user_id?: string | null
        }
        Relationships: []
      }
      einforma_automation_rules: {
        Row: {
          action_config: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          priority: number
          rule_name: string
          rule_type: string
          trigger_conditions: Json
          updated_at: string
        }
        Insert: {
          action_config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          priority?: number
          rule_name: string
          rule_type: string
          trigger_conditions?: Json
          updated_at?: string
        }
        Update: {
          action_config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          priority?: number
          rule_name?: string
          rule_type?: string
          trigger_conditions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      einforma_config: {
        Row: {
          config_key: string
          config_value: Json
          description: string | null
          id: string
          is_global: boolean
          updated_at: string
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          description?: string | null
          id?: string
          is_global?: boolean
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          description?: string | null
          id?: string
          is_global?: boolean
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      einforma_cost_tracking: {
        Row: {
          billing_month: string
          bulk_discount_applied: number | null
          company_id: string | null
          consultation_date: string
          consultation_type: string
          cost_amount: number
          cost_prediction_accuracy: number | null
          id: string
          is_bulk_operation: boolean
          request_data: Json | null
          response_data: Json | null
          user_id: string
        }
        Insert: {
          billing_month?: string
          bulk_discount_applied?: number | null
          company_id?: string | null
          consultation_date?: string
          consultation_type: string
          cost_amount: number
          cost_prediction_accuracy?: number | null
          id?: string
          is_bulk_operation?: boolean
          request_data?: Json | null
          response_data?: Json | null
          user_id: string
        }
        Update: {
          billing_month?: string
          bulk_discount_applied?: number | null
          company_id?: string | null
          consultation_date?: string
          consultation_type?: string
          cost_amount?: number
          cost_prediction_accuracy?: number | null
          id?: string
          is_bulk_operation?: boolean
          request_data?: Json | null
          response_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "einforma_cost_tracking_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "einforma_cost_tracking_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "einforma_cost_tracking_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      einforma_sync_log: {
        Row: {
          companies_failed: number
          companies_processed: number
          companies_successful: number
          completed_at: string | null
          error_details: Json | null
          id: string
          next_sync_at: string | null
          started_at: string
          started_by: string | null
          sync_data: Json | null
          sync_status: string
          sync_type: string
          total_cost: number
        }
        Insert: {
          companies_failed?: number
          companies_processed?: number
          companies_successful?: number
          completed_at?: string | null
          error_details?: Json | null
          id?: string
          next_sync_at?: string | null
          started_at?: string
          started_by?: string | null
          sync_data?: Json | null
          sync_status?: string
          sync_type: string
          total_cost?: number
        }
        Update: {
          companies_failed?: number
          companies_processed?: number
          companies_successful?: number
          completed_at?: string | null
          error_details?: Json | null
          id?: string
          next_sync_at?: string | null
          started_at?: string
          started_by?: string | null
          sync_data?: Json | null
          sync_status?: string
          sync_type?: string
          total_cost?: number
        }
        Relationships: []
      }
      email_accounts: {
        Row: {
          created_at: string
          display_name: string | null
          email_address: string
          id: string
          imap_host: string | null
          imap_port: number | null
          is_active: boolean | null
          is_default: boolean | null
          last_sync_at: string | null
          provider: string
          settings: Json | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_username: string | null
          sync_error: string | null
          sync_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email_address: string
          id?: string
          imap_host?: string | null
          imap_port?: number | null
          is_active?: boolean | null
          is_default?: boolean | null
          last_sync_at?: string | null
          provider?: string
          settings?: Json | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email_address?: string
          id?: string
          imap_host?: string | null
          imap_port?: number | null
          is_active?: boolean | null
          is_default?: boolean | null
          last_sync_at?: string | null
          provider?: string
          settings?: Json | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_analytics: {
        Row: {
          created_at: string
          date_bucket: string
          email_id: string | null
          id: string
          metric_type: string
          metric_value: number | null
          sequence_id: string | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date_bucket: string
          email_id?: string | null
          id?: string
          metric_type: string
          metric_value?: number | null
          sequence_id?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date_bucket?: string
          email_id?: string | null
          id?: string
          metric_type?: string
          metric_value?: number | null
          sequence_id?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_conversations: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          id: string
          is_read: boolean | null
          last_email_at: string | null
          lead_id: string | null
          message_count: number | null
          participants: string[]
          subject: string | null
          thread_id: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          is_read?: boolean | null
          last_email_at?: string | null
          lead_id?: string | null
          message_count?: number | null
          participants?: string[]
          subject?: string | null
          thread_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          is_read?: boolean | null
          last_email_at?: string | null
          lead_id?: string | null
          message_count?: number | null
          participants?: string[]
          subject?: string | null
          thread_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_sequence_steps: {
        Row: {
          conditions: Json | null
          created_at: string
          delay_days: number | null
          delay_hours: number | null
          id: string
          is_active: boolean | null
          sequence_id: string
          step_number: number
          template_id: string
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          delay_days?: number | null
          delay_hours?: number | null
          id?: string
          is_active?: boolean | null
          sequence_id: string
          step_number: number
          template_id: string
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          delay_days?: number | null
          delay_hours?: number | null
          id?: string
          is_active?: boolean | null
          sequence_id?: string
          step_number?: number
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sequence_steps_sequence_id"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sequence_steps_template_id"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequences: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          success_rate: number | null
          total_steps: number | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          success_rate?: number | null
          total_steps?: number | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          success_rate?: number | null
          total_steps?: number | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          auto_reply_enabled: boolean | null
          auto_reply_message: string | null
          created_at: string
          id: string
          notification_settings: Json | null
          signature_html: string | null
          signature_text: string | null
          sync_frequency: number | null
          tracking_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_reply_enabled?: boolean | null
          auto_reply_message?: string | null
          created_at?: string
          id?: string
          notification_settings?: Json | null
          signature_html?: string | null
          signature_text?: string | null
          sync_frequency?: number | null
          tracking_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_reply_enabled?: boolean | null
          auto_reply_message?: string | null
          created_at?: string
          id?: string
          notification_settings?: Json | null
          signature_html?: string | null
          signature_text?: string | null
          sync_frequency?: number | null
          tracking_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
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
          subject: string
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
          subject?: string
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      email_tracking_events: {
        Row: {
          created_at: string
          email_id: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email_id: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email_id?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tracking_events_email_id"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          account_id: string
          bcc_emails: string[] | null
          body_html: string | null
          body_text: string | null
          cc_emails: string[] | null
          clicked_at: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          deal_id: string | null
          direction: string
          email_date: string
          has_attachments: boolean | null
          id: string
          is_read: boolean | null
          is_starred: boolean | null
          lead_id: string | null
          message_id: string
          opened_at: string | null
          recipient_emails: string[]
          replied_at: string | null
          sender_email: string
          sender_name: string | null
          sequence_id: string | null
          sequence_step: number | null
          status: string | null
          subject: string | null
          template_id: string | null
          thread_id: string | null
          tracking_pixel_url: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          bcc_emails?: string[] | null
          body_html?: string | null
          body_text?: string | null
          cc_emails?: string[] | null
          clicked_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          direction: string
          email_date: string
          has_attachments?: boolean | null
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          lead_id?: string | null
          message_id: string
          opened_at?: string | null
          recipient_emails?: string[]
          replied_at?: string | null
          sender_email: string
          sender_name?: string | null
          sequence_id?: string | null
          sequence_step?: number | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          thread_id?: string | null
          tracking_pixel_url?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          bcc_emails?: string[] | null
          body_html?: string | null
          body_text?: string | null
          cc_emails?: string[] | null
          clicked_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          direction?: string
          email_date?: string
          has_attachments?: boolean | null
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          lead_id?: string | null
          message_id?: string
          opened_at?: string | null
          recipient_emails?: string[]
          replied_at?: string | null
          sender_email?: string
          sender_name?: string | null
          sequence_id?: string | null
          sequence_step?: number | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          thread_id?: string | null
          tracking_pixel_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_emails_account_id"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_emails_sequence_id"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_emails_template_id"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
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
      feature_analytics: {
        Row: {
          action: string
          feature_key: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          organization_id: string | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          feature_key: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          feature_key?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          organization_id?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean
          environment: string | null
          id: string
          key: string
          organization_id: string | null
          rollout_percentage: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          environment?: string | null
          id?: string
          key: string
          organization_id?: string | null
          rollout_percentage?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          environment?: string | null
          id?: string
          key?: string
          organization_id?: string | null
          rollout_percentage?: number | null
          updated_at?: string
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
      hb_contacts: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      hubspot: {
        Row: {
          "Análisis detallado 1 de la fuente de tráfico más reciente":
            | string
            | null
          Apellidos: string | null
          "Associated Deal": string | null
          "Associated Deal IDs": string | null
          "CCAA Spain": string | null
          Correo: string | null
          "Estado del contacto de marketing": string | null
          "Estado del lead": string | null
          "Fecha de creación": string | null
          "ID de registro": number | null
          Marcas: string | null
          Nombre: string | null
          "Número de Restaurantes": string | null
          "Número de teléfono": string | null
          "Propietario del contacto": string | null
          "Última actividad": string | null
          "URL del sitio web": string | null
          "URL Perfil Linkedin": string | null
          "Valor del negocio más reciente": string | null
        }
        Insert: {
          "Análisis detallado 1 de la fuente de tráfico más reciente"?:
            | string
            | null
          Apellidos?: string | null
          "Associated Deal"?: string | null
          "Associated Deal IDs"?: string | null
          "CCAA Spain"?: string | null
          Correo?: string | null
          "Estado del contacto de marketing"?: string | null
          "Estado del lead"?: string | null
          "Fecha de creación"?: string | null
          "ID de registro"?: number | null
          Marcas?: string | null
          Nombre?: string | null
          "Número de Restaurantes"?: string | null
          "Número de teléfono"?: string | null
          "Propietario del contacto"?: string | null
          "Última actividad"?: string | null
          "URL del sitio web"?: string | null
          "URL Perfil Linkedin"?: string | null
          "Valor del negocio más reciente"?: string | null
        }
        Update: {
          "Análisis detallado 1 de la fuente de tráfico más reciente"?:
            | string
            | null
          Apellidos?: string | null
          "Associated Deal"?: string | null
          "Associated Deal IDs"?: string | null
          "CCAA Spain"?: string | null
          Correo?: string | null
          "Estado del contacto de marketing"?: string | null
          "Estado del lead"?: string | null
          "Fecha de creación"?: string | null
          "ID de registro"?: number | null
          Marcas?: string | null
          Nombre?: string | null
          "Número de Restaurantes"?: string | null
          "Número de teléfono"?: string | null
          "Propietario del contacto"?: string | null
          "Última actividad"?: string | null
          "URL del sitio web"?: string | null
          "URL Perfil Linkedin"?: string | null
          "Valor del negocio más reciente"?: string | null
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
      lead_checklist_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          item_id: string
          lead_id: string
          stage_id: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          item_id: string
          lead_id: string
          stage_id: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          item_id?: string
          lead_id?: string
          stage_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_checklist_progress_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "stage_checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_checklist_progress_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_checklist_progress_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_emails: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          last_open_at: string | null
          lead_id: string
          open_count: number
          provider_message_id: string | null
          sent_at: string | null
          status: string
          subject: string
          to_email: string
          tracking_id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_open_at?: string | null
          lead_id: string
          open_count?: number
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          to_email: string
          tracking_id?: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_open_at?: string | null
          lead_id?: string
          open_count?: number
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          to_email?: string
          tracking_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_emails_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
      lead_form_submissions: {
        Row: {
          cif: string | null
          company_name: string | null
          competitive_advantage: string | null
          contact_name: string | null
          created_at: string
          created_by: string | null
          ebitda: number | null
          ebitda_multiple_used: number | null
          email: string | null
          employee_range: string | null
          final_valuation: number | null
          id: string
          industry: string | null
          ip_address: unknown | null
          lead_id: string | null
          location: string | null
          ownership_participation: string | null
          phone: string | null
          processed_at: string | null
          raw_payload: Json
          received_at: string
          referrer: string | null
          revenue: number | null
          source: string
          sync_error: string | null
          sync_status: string
          unique_token: string | null
          updated_at: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          valuation_range_max: number | null
          valuation_range_min: number | null
          years_of_operation: number | null
        }
        Insert: {
          cif?: string | null
          company_name?: string | null
          competitive_advantage?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          ebitda?: number | null
          ebitda_multiple_used?: number | null
          email?: string | null
          employee_range?: string | null
          final_valuation?: number | null
          id?: string
          industry?: string | null
          ip_address?: unknown | null
          lead_id?: string | null
          location?: string | null
          ownership_participation?: string | null
          phone?: string | null
          processed_at?: string | null
          raw_payload?: Json
          received_at?: string
          referrer?: string | null
          revenue?: number | null
          source?: string
          sync_error?: string | null
          sync_status?: string
          unique_token?: string | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          valuation_range_max?: number | null
          valuation_range_min?: number | null
          years_of_operation?: number | null
        }
        Update: {
          cif?: string | null
          company_name?: string | null
          competitive_advantage?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          ebitda?: number | null
          ebitda_multiple_used?: number | null
          email?: string | null
          employee_range?: string | null
          final_valuation?: number | null
          id?: string
          industry?: string | null
          ip_address?: unknown | null
          lead_id?: string | null
          location?: string | null
          ownership_participation?: string | null
          phone?: string | null
          processed_at?: string | null
          raw_payload?: Json
          received_at?: string
          referrer?: string | null
          revenue?: number | null
          source?: string
          sync_error?: string | null
          sync_status?: string
          unique_token?: string | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          valuation_range_max?: number | null
          valuation_range_min?: number | null
          years_of_operation?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_form_submissions_lead_id_fkey"
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
      lead_links: {
        Row: {
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: string
          id: string
          lead_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
          lead_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_links_lead_id_fkey"
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
      lead_tags: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          source: string
          tag: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          source?: string
          tag: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          source?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tags_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_task_engine: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          id: string
          lead_id: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["lead_task_priority"]
          sla_breached: boolean | null
          sla_hours: number | null
          status: Database["public"]["Enums"]["lead_task_status"]
          title: string
          type: Database["public"]["Enums"]["lead_task_type"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["lead_task_priority"]
          sla_breached?: boolean | null
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["lead_task_status"]
          title: string
          type: Database["public"]["Enums"]["lead_task_type"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["lead_task_priority"]
          sla_breached?: boolean | null
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["lead_task_status"]
          title?: string
          type?: Database["public"]["Enums"]["lead_task_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_task_engine_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_task_engine_audits: {
        Row: {
          change_type: string
          changed_by: string | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          task_id: string
        }
        Insert: {
          change_type: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          task_id: string
        }
        Update: {
          change_type?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_task_engine_audits_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lead_task_engine"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_task_engine_notifications: {
        Row: {
          channel: string
          created_at: string
          id: string
          kind: string
          sent_at: string
          task_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          kind: string
          sent_at?: string
          task_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          kind?: string
          sent_at?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_task_engine_notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lead_task_engine"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_task_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: Database["public"]["Enums"]["lead_task_event_type"]
          id: string
          task_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: Database["public"]["Enums"]["lead_task_event_type"]
          id?: string
          task_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: Database["public"]["Enums"]["lead_task_event_type"]
          id?: string
          task_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_task_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "lead_task_engine"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_task_sla_policies: {
        Row: {
          created_at: string
          default_sla_hours: number
          escalation_rules: Json | null
          id: string
          is_active: boolean | null
          priority: Database["public"]["Enums"]["lead_task_priority"]
          sla_hours: number
          task_type: Database["public"]["Enums"]["lead_task_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_sla_hours?: number
          escalation_rules?: Json | null
          id?: string
          is_active?: boolean | null
          priority: Database["public"]["Enums"]["lead_task_priority"]
          sla_hours: number
          task_type: Database["public"]["Enums"]["lead_task_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_sla_hours?: number
          escalation_rules?: Json | null
          id?: string
          is_active?: boolean | null
          priority?: Database["public"]["Enums"]["lead_task_priority"]
          sla_hours?: number
          task_type?: Database["public"]["Enums"]["lead_task_type"]
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
      lead_valuations: {
        Row: {
          company: Json | null
          created_at: string
          id: string
          pdf_url: string | null
          result: Json | null
          source: string | null
          tags: Json | null
        }
        Insert: {
          company?: Json | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          result?: Json | null
          source?: string | null
          tags?: Json | null
        }
        Update: {
          company?: Json | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          result?: Json | null
          source?: string | null
          tags?: Json | null
        }
        Relationships: []
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
          assigned_to_id: string
          collaborator_id: string | null
          company_id: string | null
          company_name: string | null
          conversion_date: string | null
          converted_to_mandate_id: string | null
          created_at: string
          created_by: string
          deal_value: number | null
          email: string
          estimated_close_date: string | null
          extra: Json | null
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
          assigned_to_id: string
          collaborator_id?: string | null
          company_id?: string | null
          company_name?: string | null
          conversion_date?: string | null
          converted_to_mandate_id?: string | null
          created_at?: string
          created_by: string
          deal_value?: number | null
          email: string
          estimated_close_date?: string | null
          extra?: Json | null
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
          assigned_to_id?: string
          collaborator_id?: string | null
          company_id?: string | null
          company_name?: string | null
          conversion_date?: string | null
          converted_to_mandate_id?: string | null
          created_at?: string
          created_by?: string
          deal_value?: number | null
          email?: string
          estimated_close_date?: string | null
          extra?: Json | null
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
            foreignKeyName: "leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      ma_pipeline_stages: {
        Row: {
          automation: string | null
          color: string | null
          condition_to_advance: string | null
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          name: string
          probability_pct: number
          stage_order: number
          updated_at: string | null
        }
        Insert: {
          automation?: string | null
          color?: string | null
          condition_to_advance?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          probability_pct: number
          stage_order: number
          updated_at?: string | null
        }
        Update: {
          automation?: string | null
          color?: string | null
          condition_to_advance?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          probability_pct?: number
          stage_order?: number
          updated_at?: string | null
        }
        Relationships: []
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
      mandate_matches: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          mandate_id: string
          match_details: Json | null
          match_score: number
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          mandate_id: string
          match_details?: Json | null
          match_score: number
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          mandate_id?: string
          match_details?: Json | null
          match_score?: number
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mandate_matches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandate_matches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandate_matches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "hubspot_companies_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandate_matches_mandate_id_fkey"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
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
      meeting_templates: {
        Row: {
          agenda_template: string | null
          created_at: string | null
          default_attendees: Json | null
          description: string | null
          duration_minutes: number
          follow_up_template: string | null
          id: string
          is_shared: boolean | null
          location_template: string | null
          meeting_type: string
          name: string
          preparation_checklist: Json | null
          questions: Json | null
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          agenda_template?: string | null
          created_at?: string | null
          default_attendees?: Json | null
          description?: string | null
          duration_minutes?: number
          follow_up_template?: string | null
          id?: string
          is_shared?: boolean | null
          location_template?: string | null
          meeting_type: string
          name: string
          preparation_checklist?: Json | null
          questions?: Json | null
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          agenda_template?: string | null
          created_at?: string | null
          default_attendees?: Json | null
          description?: string | null
          duration_minutes?: number
          follow_up_template?: string | null
          id?: string
          is_shared?: boolean | null
          location_template?: string | null
          meeting_type?: string
          name?: string
          preparation_checklist?: Json | null
          questions?: Json | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
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
      "negocios hb": {
        Row: {
          "Associated Company": string | null
          "Associated Company IDs": string | null
          "Associated Contact": string | null
          "Associated Contact IDs": string | null
          "Descripción de la oferta": string | null
          "Etapa del negocio": string | null
          "Fecha de cierre": string | null
          "Fecha de creación": string | null
          "ID de registro": number | null
          "Ingresos anuales recurrentes": string | null
          "Ingresos mensuales recurrentes": string | null
          "Nombre del negocio": string | null
          "Propietario del negocio": string | null
          Valor: string | null
        }
        Insert: {
          "Associated Company"?: string | null
          "Associated Company IDs"?: string | null
          "Associated Contact"?: string | null
          "Associated Contact IDs"?: string | null
          "Descripción de la oferta"?: string | null
          "Etapa del negocio"?: string | null
          "Fecha de cierre"?: string | null
          "Fecha de creación"?: string | null
          "ID de registro"?: number | null
          "Ingresos anuales recurrentes"?: string | null
          "Ingresos mensuales recurrentes"?: string | null
          "Nombre del negocio"?: string | null
          "Propietario del negocio"?: string | null
          Valor?: string | null
        }
        Update: {
          "Associated Company"?: string | null
          "Associated Company IDs"?: string | null
          "Associated Contact"?: string | null
          "Associated Contact IDs"?: string | null
          "Descripción de la oferta"?: string | null
          "Etapa del negocio"?: string | null
          "Fecha de cierre"?: string | null
          "Fecha de creación"?: string | null
          "ID de registro"?: number | null
          "Ingresos anuales recurrentes"?: string | null
          "Ingresos mensuales recurrentes"?: string | null
          "Nombre del negocio"?: string | null
          "Propietario del negocio"?: string | null
          Valor?: string | null
        }
        Relationships: []
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
          investment_capacity: number | null
          is_active: boolean
          location: string | null
          multiplier: number | null
          notes: string | null
          opportunity_score: number
          opportunity_type: string
          priority: string | null
          probability: number | null
          revenue: number | null
          rod_order: number | null
          score_updated_at: string
          sector: string | null
          sector_attractiveness: number | null
          stage: string
          status: string
          strategic_fit: number | null
          title: string
          updated_at: string
          urgency: number | null
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
          investment_capacity?: number | null
          is_active?: boolean
          location?: string | null
          multiplier?: number | null
          notes?: string | null
          opportunity_score?: number
          opportunity_type?: string
          priority?: string | null
          probability?: number | null
          revenue?: number | null
          rod_order?: number | null
          score_updated_at?: string
          sector?: string | null
          sector_attractiveness?: number | null
          stage?: string
          status?: string
          strategic_fit?: number | null
          title: string
          updated_at?: string
          urgency?: number | null
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
          investment_capacity?: number | null
          is_active?: boolean
          location?: string | null
          multiplier?: number | null
          notes?: string | null
          opportunity_score?: number
          opportunity_type?: string
          priority?: string | null
          probability?: number | null
          revenue?: number | null
          rod_order?: number | null
          score_updated_at?: string
          sector?: string | null
          sector_attractiveness?: number | null
          stage?: string
          status?: string
          strategic_fit?: number | null
          title?: string
          updated_at?: string
          urgency?: number | null
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
      opportunity_score_events: {
        Row: {
          created_at: string
          factor_snapshot: Json
          id: string
          metadata: Json
          new_score: number | null
          old_score: number | null
          opportunity_id: string
          probability: number | null
          stage: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          factor_snapshot?: Json
          id?: string
          metadata?: Json
          new_score?: number | null
          old_score?: number | null
          opportunity_id: string
          probability?: number | null
          stage?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          factor_snapshot?: Json
          id?: string
          metadata?: Json
          new_score?: number | null
          old_score?: number | null
          opportunity_id?: string
          probability?: number | null
          stage?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_score_events_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          token: string
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token: string
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      pipeline_stage_automations: {
        Row: {
          action_data: Json
          action_type: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          stage_id: string
          updated_at: string
        }
        Insert: {
          action_data?: Json
          action_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          stage_id: string
          updated_at?: string
        }
        Update: {
          action_data?: Json
          action_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          stage_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stage_automations_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          probability: number | null
          slug: string | null
          stage_config: Json | null
          stage_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          probability?: number | null
          slug?: string | null
          stage_config?: Json | null
          stage_order: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          probability?: number | null
          slug?: string | null
          stage_config?: Json | null
          stage_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      pipeline_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_data: Json
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_data?: Json
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
      productivity_patterns: {
        Row: {
          confidence_level: number | null
          created_at: string
          data_points_count: number | null
          id: string
          last_calculated: string | null
          pattern_data: Json
          pattern_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          data_points_count?: number | null
          id?: string
          last_calculated?: string | null
          pattern_data: Json
          pattern_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          data_points_count?: number | null
          id?: string
          last_calculated?: string | null
          pattern_data?: Json
          pattern_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      productivity_settings: {
        Row: {
          auto_categorization_enabled: boolean | null
          break_reminder_interval: number | null
          created_at: string
          daily_hours_target: number | null
          id: string
          productivity_tracking_enabled: boolean | null
          smart_suggestions_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_categorization_enabled?: boolean | null
          break_reminder_interval?: number | null
          created_at?: string
          daily_hours_target?: number | null
          id?: string
          productivity_tracking_enabled?: boolean | null
          smart_suggestions_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_categorization_enabled?: boolean | null
          break_reminder_interval?: number | null
          created_at?: string
          daily_hours_target?: number | null
          id?: string
          productivity_tracking_enabled?: boolean | null
          smart_suggestions_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_rates: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string | null
          effective_from: string | null
          effective_to: string | null
          entity_id: string
          entity_type: string
          hourly_rate: number
          id: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          effective_from?: string | null
          effective_to?: string | null
          entity_id: string
          entity_type: string
          hourly_rate: number
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          effective_from?: string | null
          effective_to?: string | null
          entity_id?: string
          entity_type?: string
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      proposal_analytics: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          event_type: string
          id: string
          ip_address: unknown | null
          location: string | null
          metadata: Json | null
          os: string | null
          proposal_id: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          location?: string | null
          metadata?: Json | null
          os?: string | null
          proposal_id: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          location?: string | null
          metadata?: Json | null
          os?: string | null
          proposal_id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_analytics_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_email_tracking: {
        Row: {
          bounced_at: string | null
          click_count: number | null
          click_tracking_urls: Json | null
          clicked_at: string | null
          created_at: string
          email_subject: string | null
          id: string
          metadata: Json | null
          open_count: number | null
          opened_at: string | null
          proposal_id: string
          recipient_email: string
          sent_at: string
          status: string | null
          tracking_pixel_url: string | null
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          bounced_at?: string | null
          click_count?: number | null
          click_tracking_urls?: Json | null
          clicked_at?: string | null
          created_at?: string
          email_subject?: string | null
          id?: string
          metadata?: Json | null
          open_count?: number | null
          opened_at?: string | null
          proposal_id: string
          recipient_email: string
          sent_at?: string
          status?: string | null
          tracking_pixel_url?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          bounced_at?: string | null
          click_count?: number | null
          click_tracking_urls?: Json | null
          clicked_at?: string | null
          created_at?: string
          email_subject?: string | null
          id?: string
          metadata?: Json | null
          open_count?: number | null
          opened_at?: string | null
          proposal_id?: string
          recipient_email?: string
          sent_at?: string
          status?: string | null
          tracking_pixel_url?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_email_tracking_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_stats: {
        Row: {
          avg_duration_seconds: number | null
          bounce_rate: number | null
          conversion_rate: number | null
          created_at: string
          downloads: number | null
          email_clicks: number | null
          email_opens: number | null
          engagement_score: number | null
          id: string
          last_viewed_at: string | null
          proposal_id: string
          shares: number | null
          total_duration_seconds: number | null
          total_views: number | null
          unique_views: number | null
          updated_at: string
        }
        Insert: {
          avg_duration_seconds?: number | null
          bounce_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
          downloads?: number | null
          email_clicks?: number | null
          email_opens?: number | null
          engagement_score?: number | null
          id?: string
          last_viewed_at?: string | null
          proposal_id: string
          shares?: number | null
          total_duration_seconds?: number | null
          total_views?: number | null
          unique_views?: number | null
          updated_at?: string
        }
        Update: {
          avg_duration_seconds?: number | null
          bounce_rate?: number | null
          conversion_rate?: number | null
          created_at?: string
          downloads?: number | null
          email_clicks?: number | null
          email_opens?: number | null
          engagement_score?: number | null
          id?: string
          last_viewed_at?: string | null
          proposal_id?: string
          shares?: number | null
          total_duration_seconds?: number | null
          total_views?: number | null
          unique_views?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_stats_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          category: string
          content_structure: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          practice_area_id: string | null
          success_rate: number | null
          updated_at: string | null
          usage_count: number | null
          visual_config: Json
        }
        Insert: {
          category: string
          content_structure?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          practice_area_id?: string | null
          success_rate?: number | null
          updated_at?: string | null
          usage_count?: number | null
          visual_config?: Json
        }
        Update: {
          category?: string
          content_structure?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          practice_area_id?: string | null
          success_rate?: number | null
          updated_at?: string | null
          usage_count?: number | null
          visual_config?: Json
        }
        Relationships: [
          {
            foreignKeyName: "proposal_templates_practice_area_id_fkey"
            columns: ["practice_area_id"]
            isOneToOne: false
            referencedRelation: "practice_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_view_sessions: {
        Row: {
          conversion_action: string | null
          created_at: string
          device_info: Json | null
          email: string | null
          ended_at: string | null
          engagement_score: number | null
          id: string
          ip_address: unknown | null
          pages_viewed: number | null
          proposal_id: string
          sections_viewed: Json | null
          session_id: string
          started_at: string
          total_duration_seconds: number | null
          updated_at: string
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          conversion_action?: string | null
          created_at?: string
          device_info?: Json | null
          email?: string | null
          ended_at?: string | null
          engagement_score?: number | null
          id?: string
          ip_address?: unknown | null
          pages_viewed?: number | null
          proposal_id: string
          sections_viewed?: Json | null
          session_id: string
          started_at?: string
          total_duration_seconds?: number | null
          updated_at?: string
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          conversion_action?: string | null
          created_at?: string
          device_info?: Json | null
          email?: string | null
          ended_at?: string | null
          engagement_score?: number | null
          id?: string
          ip_address?: unknown | null
          pages_viewed?: number | null
          proposal_id?: string
          sections_viewed?: Json | null
          session_id?: string
          started_at?: string
          total_duration_seconds?: number | null
          updated_at?: string
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_view_sessions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
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
      rod_comments: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          parent_id: string | null
          position_data: Json | null
          rod_id: string
          rod_version_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          parent_id?: string | null
          position_data?: Json | null
          rod_id: string
          rod_version_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          parent_id?: string | null
          position_data?: Json | null
          rod_id?: string
          rod_version_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rod_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "rod_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rod_comments_rod_version_id_fkey"
            columns: ["rod_version_id"]
            isOneToOne: false
            referencedRelation: "rod_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      rod_engagement: {
        Row: {
          click_position: Json | null
          engagement_score: number | null
          event_type: string
          id: string
          rod_log_id: string | null
          section_id: string | null
          subscriber_email: string
          timestamp: string | null
        }
        Insert: {
          click_position?: Json | null
          engagement_score?: number | null
          event_type: string
          id?: string
          rod_log_id?: string | null
          section_id?: string | null
          subscriber_email: string
          timestamp?: string | null
        }
        Update: {
          click_position?: Json | null
          engagement_score?: number | null
          event_type?: string
          id?: string
          rod_log_id?: string | null
          section_id?: string | null
          subscriber_email?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rod_engagement_rod_log_id_fkey"
            columns: ["rod_log_id"]
            isOneToOne: false
            referencedRelation: "rod_log"
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
      rod_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_data: Json
          template_type: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_data?: Json
          template_type?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_data?: Json
          template_type?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      rod_versions: {
        Row: {
          changes_summary: string | null
          content: Json
          created_at: string | null
          created_by: string | null
          id: string
          rod_id: string
          title: string
          version_number: number
        }
        Insert: {
          changes_summary?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          rod_id: string
          title: string
          version_number: number
        }
        Update: {
          changes_summary?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          rod_id?: string
          title?: string
          version_number?: number
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
      stage_actions: {
        Row: {
          action_config: Json
          action_name: string
          action_type: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          is_required: boolean
          order_index: number
          stage_id: string
          updated_at: string
        }
        Insert: {
          action_config?: Json
          action_name: string
          action_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          order_index?: number
          stage_id: string
          updated_at?: string
        }
        Update: {
          action_config?: Json
          action_name?: string
          action_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          order_index?: number
          stage_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stage_checklist_items: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_required: boolean
          label: string
          order_index: number
          stage_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          label: string
          order_index?: number
          stage_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          label?: string
          order_index?: number
          stage_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_checklist_items_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
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
          required_fields: Json | null
          stage_config: Json | null
          updated_at: string
          validation_rules: Json | null
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
          required_fields?: Json | null
          stage_config?: Json | null
          updated_at?: string
          validation_rules?: Json | null
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
          required_fields?: Json | null
          stage_config?: Json | null
          updated_at?: string
          validation_rules?: Json | null
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
      subscriber_behavior_scores: {
        Row: {
          behavior_data: Json | null
          engagement_score: number | null
          frequency_score: number | null
          id: string
          last_calculated_at: string | null
          recency_score: number | null
          subscriber_id: string | null
          total_score: number | null
        }
        Insert: {
          behavior_data?: Json | null
          engagement_score?: number | null
          frequency_score?: number | null
          id?: string
          last_calculated_at?: string | null
          recency_score?: number | null
          subscriber_id?: string | null
          total_score?: number | null
        }
        Update: {
          behavior_data?: Json | null
          engagement_score?: number | null
          frequency_score?: number | null
          id?: string
          last_calculated_at?: string | null
          recency_score?: number | null
          subscriber_id?: string | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriber_behavior_scores_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: true
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriber_segment_members: {
        Row: {
          added_at: string | null
          added_by: string | null
          id: string
          segment_id: string | null
          subscriber_id: string | null
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          segment_id?: string | null
          subscriber_id?: string | null
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          segment_id?: string | null
          subscriber_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriber_segment_members_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "subscriber_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriber_segment_members_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriber_segments: {
        Row: {
          conditions: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_dynamic: boolean | null
          last_calculated_at: string | null
          name: string
          segment_type: string
          subscriber_count: number | null
          updated_at: string | null
        }
        Insert: {
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          last_calculated_at?: string | null
          name: string
          segment_type?: string
          subscriber_count?: number | null
          updated_at?: string | null
        }
        Update: {
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          last_calculated_at?: string | null
          name?: string
          segment_type?: string
          subscriber_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          acquisition_source: string | null
          behavior_score: number | null
          created_at: string
          custom_fields: Json | null
          email: string
          engagement_level: string | null
          id: string
          last_engagement_at: string | null
          lifecycle_stage: string | null
          segment: string
          tags: string[] | null
          unsubscribed: boolean
          verified: boolean
        }
        Insert: {
          acquisition_source?: string | null
          behavior_score?: number | null
          created_at?: string
          custom_fields?: Json | null
          email: string
          engagement_level?: string | null
          id?: string
          last_engagement_at?: string | null
          lifecycle_stage?: string | null
          segment?: string
          tags?: string[] | null
          unsubscribed?: boolean
          verified?: boolean
        }
        Update: {
          acquisition_source?: string | null
          behavior_score?: number | null
          created_at?: string
          custom_fields?: Json | null
          email?: string
          engagement_level?: string | null
          id?: string
          last_engagement_at?: string | null
          lifecycle_stage?: string | null
          segment?: string
          tags?: string[] | null
          unsubscribed?: boolean
          verified?: boolean
        }
        Relationships: []
      }
      system_notifications: {
        Row: {
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          priority: string | null
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
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
          deal_id: string | null
          email_sent_at: string | null
          entity_id: string | null
          entity_name: string | null
          id: string
          message: string
          negocio_id: string | null
          notification_type: string
          read_at: string | null
          reminder_type: string | null
          scheduled_for: string | null
          status: string | null
          task_id: string
          task_title: string
          task_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          days_overdue?: number
          deal_id?: string | null
          email_sent_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          id?: string
          message: string
          negocio_id?: string | null
          notification_type: string
          read_at?: string | null
          reminder_type?: string | null
          scheduled_for?: string | null
          status?: string | null
          task_id: string
          task_title: string
          task_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          days_overdue?: number
          deal_id?: string | null
          email_sent_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          id?: string
          message?: string
          negocio_id?: string | null
          notification_type?: string
          read_at?: string | null
          reminder_type?: string | null
          scheduled_for?: string | null
          status?: string | null
          task_id?: string
          task_title?: string
          task_type?: string
          user_id?: string
        }
        Relationships: []
      }
      taxonomy_dimensions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          entity_scope: string
          id: string
          is_active: boolean
          key: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          entity_scope?: string
          id?: string
          is_active?: boolean
          key: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          entity_scope?: string
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      taxonomy_values: {
        Row: {
          created_at: string
          created_by: string | null
          dimension_id: string
          id: string
          is_active: boolean
          label: string
          metadata: Json
          parent_id: string | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dimension_id: string
          id?: string
          is_active?: boolean
          label: string
          metadata?: Json
          parent_id?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dimension_id?: string
          id?: string
          is_active?: boolean
          label?: string
          metadata?: Json
          parent_id?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_values_dimension_id_fkey"
            columns: ["dimension_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_dimensions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taxonomy_values_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_values"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          added_at: string
          added_by: string | null
          id: string
          role: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          id?: string
          role?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          id?: string
          role?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
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
      template_sections: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_system: boolean | null
          title: string
          type: string
          variables: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          title: string
          type: string
          variables?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          title?: string
          type?: string
          variables?: Json | null
        }
        Relationships: []
      }
      territories: {
        Row: {
          boundaries: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          exclusivity_level: string | null
          id: string
          name: string
          territory_type: string
          updated_at: string | null
        }
        Insert: {
          boundaries?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          exclusivity_level?: string | null
          id?: string
          name: string
          territory_type: string
          updated_at?: string | null
        }
        Update: {
          boundaries?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          exclusivity_level?: string | null
          id?: string
          name?: string
          territory_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          activity_type: string
          auto_categorized: boolean | null
          billing_status: string | null
          break_type: string | null
          category_id: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          focus_score: number | null
          hourly_rate: number | null
          id: string
          interruptions_count: number | null
          is_billable: boolean
          lead_id: string | null
          mandate_id: string | null
          metadata: Json | null
          operation_id: string | null
          planned_task_id: string | null
          project_rate_id: string | null
          start_time: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type?: string
          auto_categorized?: boolean | null
          billing_status?: string | null
          break_type?: string | null
          category_id?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          focus_score?: number | null
          hourly_rate?: number | null
          id?: string
          interruptions_count?: number | null
          is_billable?: boolean
          lead_id?: string | null
          mandate_id?: string | null
          metadata?: Json | null
          operation_id?: string | null
          planned_task_id?: string | null
          project_rate_id?: string | null
          start_time: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          auto_categorized?: boolean | null
          billing_status?: string | null
          break_type?: string | null
          category_id?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          focus_score?: number | null
          hourly_rate?: number | null
          id?: string
          interruptions_count?: number | null
          is_billable?: boolean
          lead_id?: string | null
          mandate_id?: string | null
          metadata?: Json | null
          operation_id?: string | null
          planned_task_id?: string | null
          project_rate_id?: string | null
          start_time?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_time_entries_lead"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_time_entries_mandate"
            columns: ["mandate_id"]
            isOneToOne: false
            referencedRelation: "buying_mandates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "activity_categories"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "time_entries_project_rate_id_fkey"
            columns: ["project_rate_id"]
            isOneToOne: false
            referencedRelation: "project_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entry_approvals: {
        Row: {
          approved_amount: number | null
          approver_id: string
          comments: string | null
          created_at: string
          id: string
          requested_by: string
          reviewed_at: string | null
          status: string | null
          submitted_at: string
          time_entry_id: string
          updated_at: string
        }
        Insert: {
          approved_amount?: number | null
          approver_id: string
          comments?: string | null
          created_at?: string
          id?: string
          requested_by: string
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string
          time_entry_id: string
          updated_at?: string
        }
        Update: {
          approved_amount?: number | null
          approver_id?: string
          comments?: string | null
          created_at?: string
          id?: string
          requested_by?: string
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string
          time_entry_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entry_approvals_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
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
      time_tracking_analytics: {
        Row: {
          activities_count: number | null
          billable_minutes: number | null
          break_minutes: number | null
          created_at: string
          date: string
          efficiency_score: number | null
          focus_score: number | null
          id: string
          productive_minutes: number | null
          revenue_generated: number | null
          total_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activities_count?: number | null
          billable_minutes?: number | null
          break_minutes?: number | null
          created_at?: string
          date: string
          efficiency_score?: number | null
          focus_score?: number | null
          id?: string
          productive_minutes?: number | null
          revenue_generated?: number | null
          total_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activities_count?: number | null
          billable_minutes?: number | null
          break_minutes?: number | null
          created_at?: string
          date?: string
          efficiency_score?: number | null
          focus_score?: number | null
          id?: string
          productive_minutes?: number | null
          revenue_generated?: number | null
          total_minutes?: number | null
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
      valuation_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          ip_address: unknown | null
          payload: Json | null
          session_id: string | null
          step: number | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          ip_address?: unknown | null
          payload?: Json | null
          session_id?: string | null
          step?: number | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          ip_address?: unknown | null
          payload?: Json | null
          session_id?: string | null
          step?: number | null
          user_agent?: string | null
        }
        Relationships: []
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
      feature_adoption_summary: {
        Row: {
          dialog_opened: number | null
          entity_created: number | null
          entity_creation_failed: number | null
          environment: string | null
          feature_key: string | null
          metric_date: string | null
          success_rate: number | null
        }
        Relationships: []
      }
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
          pipeline_stage_id: string | null
          stage_count: number | null
          stage_label: string | null
          stage_percent: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_pipeline_stage_id_fkey"
            columns: ["pipeline_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_leads_kpi: {
        Row: {
          avg_lead_score: number | null
          avg_prob_conversion: number | null
          contacted_leads: number | null
          disqualified_leads: number | null
          new_leads_30d: number | null
          new_leads_7d: number | null
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
      assign_lead: {
        Args: { p_lead_id: string; p_user_id: string }
        Returns: Json
      }
      assign_owner_on_create: {
        Args: { p_lead_id: string }
        Returns: Json
      }
      assign_role_after_signup: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: Json
      }
      assign_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: Json
      }
      assign_user_role_secure: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
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
      can_manage_all_leads: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_auth_rate_limit: {
        Args: { p_identifier: string }
        Returns: boolean
      }
      check_auto_assignment_system: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_document_permission: {
        Args: {
          p_document_id: string
          p_required_permission: string
          p_user_id: string
        }
        Returns: boolean
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
        Args:
          | { p_action?: string; p_identifier: string }
          | {
              p_identifier: string
              p_max_requests?: number
              p_operation: string
              p_window_minutes?: number
            }
        Returns: boolean
      }
      check_session_timeout: {
        Args: { p_timeout_minutes?: number; p_user_id: string }
        Returns: boolean
      }
      cleanup_old_presence: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_invitation: {
        Args: { p_token: string; p_user_id: string }
        Returns: boolean
      }
      convert_lead: {
        Args: {
          p_create_company?: boolean
          p_create_deal?: boolean
          p_lead_id: string
        }
        Returns: Json
      }
      create_deal_from_won_lead: {
        Args: { p_deal_value?: number; p_lead_id: string }
        Returns: Json
      }
      create_entity_from_lead: {
        Args: {
          p_lead_id: string
          p_link?: boolean
          p_payload: Json
          p_type: string
        }
        Returns: string
      }
      create_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      create_lead_task: {
        Args: {
          p_assigned_to?: string
          p_description?: string
          p_due_date?: string
          p_lead_id: string
          p_priority?: string
          p_title: string
        }
        Returns: string
      }
      create_mandate_from_lead: {
        Args: { lead_id: string; mandate_data: Json }
        Returns: Json
      }
      create_proposal_from_lead: {
        Args: { p_lead_id: string }
        Returns: string
      }
      create_qualification_task: {
        Args: { p_assigned_to: string; p_lead_id: string }
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
      create_user_invitation: {
        Args: {
          p_email: string
          p_role?: Database["public"]["Enums"]["app_role"]
        }
        Returns: string
      }
      create_user_with_role_secure: {
        Args: {
          p_email: string
          p_first_name?: string
          p_last_name?: string
          p_password: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: Json
      }
      create_valuation_from_lead: {
        Args: { lead_id: string; valuation_data: Json }
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
              p_description?: string
              p_event_type: string
              p_metadata?: Json
              p_severity?: string
            }
          | {
              p_description?: string
              p_event_type: string
              p_metadata?: Json
              p_severity?: string
              p_user_email?: string
            }
        Returns: string
      }
      estado_sistema_scoring: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      extract_email_domain: {
        Args: { email_input: string }
        Returns: string
      }
      fn_calculate_company_completeness_score: {
        Args: { p_company_id: string }
        Returns: number
      }
      fn_calculate_contact_completeness_score: {
        Args: { p_contact_id: string }
        Returns: number
      }
      fn_check_consent_requirements: {
        Args: { p_contact_id: string }
        Returns: Json
      }
      fn_recalcular_score_lead: {
        Args: { p_lead_id: string }
        Returns: undefined
      }
      generate_booking_slug: {
        Args: { base_title: string; user_id: string }
        Returns: string
      }
      generate_tracking_pixel_url: {
        Args: { p_email_id: string }
        Returns: string
      }
      get_all_overdue_tasks: {
        Args: Record<PropertyKey, never>
        Returns: {
          days_overdue: number
          due_date: string
          entity_id: string
          entity_name: string
          owner_email: string
          owner_id: string
          task_id: string
          task_title: string
          task_type: string
        }[]
      }
      get_current_user_role_safe: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_einforma_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_integraloop_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_lead_tasks_with_dependencies: {
        Args: { p_lead_id: string }
        Returns: {
          assigned_to: string
          can_start: boolean
          completed_at: string
          created_at: string
          created_by: string
          dependencies: string[]
          dependency_status: Json
          description: string
          due_date: string
          id: string
          lead_id: string
          metadata: Json
          priority: Database["public"]["Enums"]["lead_task_priority"]
          sla_breached: boolean
          sla_hours: number
          status: Database["public"]["Enums"]["lead_task_status"]
          title: string
          type: Database["public"]["Enums"]["lead_task_type"]
          updated_at: string
        }[]
      }
      get_pending_engine_task_reminders: {
        Args: Record<PropertyKey, never>
        Returns: {
          assignee: string
          due_date: string
          kind: string
          lead_id: string
          lead_name: string
          task_id: string
          task_type: string
          title: string
        }[]
      }
      get_pending_scheduled_reminders: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          deal_id: string
          entity_id: string
          entity_name: string
          id: string
          message: string
          negocio_id: string
          notification_type: string
          reminder_type: string
          scheduled_for: string
          task_id: string
          task_title: string
          task_type: string
          user_id: string
        }[]
      }
      get_quantum_config: {
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
      get_teams_with_member_count: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          created_by: string
          creator_name: string
          description: string
          id: string
          member_count: number
          name: string
          updated_at: string
        }[]
      }
      get_user_highest_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          action: string
          module: string
          permission_name: string
        }[]
      }
      get_users_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          first_name: string
          is_manager: boolean
          last_name: string
          role: string
          user_id: string
        }[]
      }
      has_permission: {
        Args:
          | { _permission_name: string; _user_id: string }
          | { permission_type: string }
        Returns: boolean
      }
      has_reconversion_permission: {
        Args: { p_action?: string; p_reconversion_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_secure: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
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
      log_automation_event: {
        Args: {
          p_action_data?: Json
          p_action_taken: string
          p_automation_type: string
          p_entity_id: string
          p_entity_type: string
          p_error_message?: string
          p_execution_time_ms?: number
          p_status?: string
          p_trigger_event: string
        }
        Returns: string
      }
      log_document_access: {
        Args: {
          p_access_type?: string
          p_document_id: string
          p_metadata?: Json
          p_session_duration?: number
          p_share_id?: string
        }
        Returns: string
      }
      log_lead_score_change: {
        Args: {
          p_delta: number
          p_lead_id: string
          p_regla: string
          p_total: number
        }
        Returns: string
      }
      log_reconversion_audit: {
        Args: {
          p_action_description: string
          p_action_type: string
          p_metadata?: Json
          p_new_data?: Json
          p_old_data?: Json
          p_reconversion_id: string
          p_severity?: string
        }
        Returns: string
      }
      log_security_event: {
        Args:
          | {
              p_description: string
              p_event_type: string
              p_metadata?: Json
              p_severity: string
              p_user_id?: string
            }
          | {
              p_description?: string
              p_event_type: string
              p_metadata?: Json
              p_severity?: string
            }
        Returns: string
      }
      log_security_event_enhanced: {
        Args:
          | {
              p_auto_alert?: boolean
              p_description?: string
              p_event_type: string
              p_metadata?: Json
              p_severity?: string
            }
          | {
              p_description?: string
              p_event_type: string
              p_metadata?: Json
              p_severity?: string
              p_table_name?: string
            }
        Returns: string
      }
      mark_engine_task_notified: {
        Args: { p_kind: string; p_task_id: string }
        Returns: undefined
      }
      mark_reminder_processed: {
        Args: {
          p_error_message?: string
          p_reminder_id: string
          p_status?: string
        }
        Returns: boolean
      }
      mark_winback_response: {
        Args: { p_lead_id: string; p_response_type?: string }
        Returns: undefined
      }
      match_targets_for_reconversion: {
        Args: { reconversion_id: string }
        Returns: {
          matched_companies: Json
          target_count: number
        }[]
      }
      normalize_company_name: {
        Args: { name_input: string }
        Returns: string
      }
      normalize_phone: {
        Args: { phone_input: string }
        Returns: string
      }
      obtener_token_integraloop: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      process_approval: {
        Args: {
          p_approval_id: string
          p_comments?: string
          p_status: Database["public"]["Enums"]["approval_status"]
        }
        Returns: boolean
      }
      process_automation_triggers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_email_tracking: {
        Args: {
          p_email_id: string
          p_event_data?: Json
          p_event_type: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: undefined
      }
      process_inactive_leads: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      process_reconversion_closure: {
        Args: { closure_data: Json; reconversion_id: string; user_id?: string }
        Returns: boolean
      }
      quick_create_company_from_email: {
        Args: { email_input: string }
        Returns: string
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
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: Json
      }
      run_security_audit: {
        Args: Record<PropertyKey, never>
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
          p_message: string
          p_metadata?: Json
          p_notification_type: string
          p_recipient_user_id: string
          p_reconversion_id: string
          p_title: string
        }
        Returns: string
      }
      set_environment_variables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      simple_company_workflow: {
        Args: { p_company_id: string }
        Returns: Json
      }
      simple_contact_workflow: {
        Args: { p_contact_id: string }
        Returns: Json
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
      split_full_name: {
        Args: { full_name: string }
        Returns: Json
      }
      start_document_workflow: {
        Args: { p_document_id: string; p_workflow_id: string }
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
          new_subfase: Database["public"]["Enums"]["reconversion_subfase"]
          reconversion_id: string
          user_id?: string
        }
        Returns: boolean
      }
      update_user_role_secure: {
        Args: {
          _new_role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: Json
      }
      validate_and_sanitize_input: {
        Args: { p_allow_html?: boolean; p_input: string; p_max_length?: number }
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
      validate_invitation_token: {
        Args: { p_token: string }
        Returns: Json
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: Json
      }
      validate_sensitive_data_access: {
        Args: { access_type?: string; record_id: string; table_name: string }
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
      validate_taxonomy_array: {
        Args: { p_dimension_key: string; p_values: string[] }
        Returns: boolean
      }
      validate_taxonomy_single: {
        Args: { p_dimension_key: string; p_value: string }
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
      approval_status: "pending" | "approved" | "rejected" | "revision_required"
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
      lead_task_event_type:
        | "task_created"
        | "task_completed"
        | "task_snoozed"
        | "task_reopened"
        | "sla_breached"
        | "task_assigned"
        | "task_dependency_resolved"
      lead_task_priority: "low" | "medium" | "high" | "urgent"
      lead_task_status: "open" | "done" | "snoozed"
      lead_task_type:
        | "valoracion_inicial"
        | "llamada"
        | "whatsapp"
        | "informe_mercado"
        | "datos_sabi"
        | "balances_4y"
        | "preguntas_reunion"
        | "videollamada"
        | "perfilar_oportunidad"
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
      approval_status: ["pending", "approved", "rejected", "revision_required"],
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
      lead_task_event_type: [
        "task_created",
        "task_completed",
        "task_snoozed",
        "task_reopened",
        "sla_breached",
        "task_assigned",
        "task_dependency_resolved",
      ],
      lead_task_priority: ["low", "medium", "high", "urgent"],
      lead_task_status: ["open", "done", "snoozed"],
      lead_task_type: [
        "valoracion_inicial",
        "llamada",
        "whatsapp",
        "informe_mercado",
        "datos_sabi",
        "balances_4y",
        "preguntas_reunion",
        "videollamada",
        "perfilar_oportunidad",
      ],
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
