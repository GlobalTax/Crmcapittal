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
          id: string
          location: string | null
          manager_id: string | null
          operation_type: string
          photo_url: string | null
          project_name: string | null
          revenue: number | null
          sector: string
          seller: string | null
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
    }
    Enums: {
      app_role: "superadmin" | "admin" | "user"
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
      app_role: ["superadmin", "admin", "user"],
    },
  },
} as const
