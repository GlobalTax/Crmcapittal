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
      contacts: {
        Row: {
          company: string | null
          contact_type: string
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          contact_type?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          contact_type?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
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
