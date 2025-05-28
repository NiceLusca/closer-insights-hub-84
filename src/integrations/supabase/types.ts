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
      api_configurations: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          last_used_at: string | null
          name: string
          user_id: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          user_id?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cached_tags: {
        Row: {
          api_configuration_id: string | null
          id: string
          last_fetched: string | null
          name: string
          tag_id: string
        }
        Insert: {
          api_configuration_id?: string | null
          id?: string
          last_fetched?: string | null
          name: string
          tag_id: string
        }
        Update: {
          api_configuration_id?: string | null
          id?: string
          last_fetched?: string | null
          name?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cached_tags_api_configuration_id_fkey"
            columns: ["api_configuration_id"]
            isOneToOne: false
            referencedRelation: "api_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_batches: {
        Row: {
          api_configuration_id: string | null
          created_at: string | null
          created_contacts: number
          error_contacts: number
          file_name: string
          id: string
          processing_time_ms: number | null
          selected_tag_id: string | null
          selected_tag_name: string | null
          status: string
          total_contacts: number
          updated_contacts: number
          user_id: string | null
        }
        Insert: {
          api_configuration_id?: string | null
          created_at?: string | null
          created_contacts?: number
          error_contacts?: number
          file_name: string
          id?: string
          processing_time_ms?: number | null
          selected_tag_id?: string | null
          selected_tag_name?: string | null
          status?: string
          total_contacts?: number
          updated_contacts?: number
          user_id?: string | null
        }
        Update: {
          api_configuration_id?: string | null
          created_at?: string | null
          created_contacts?: number
          error_contacts?: number
          file_name?: string
          id?: string
          processing_time_ms?: number | null
          selected_tag_id?: string | null
          selected_tag_name?: string | null
          status?: string
          total_contacts?: number
          updated_contacts?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_batches_api_configuration_id_fkey"
            columns: ["api_configuration_id"]
            isOneToOne: false
            referencedRelation: "api_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_errors: {
        Row: {
          batch_id: string | null
          created_at: string | null
          error_message: string | null
          error_type: string
          id: string
          row_data: Json
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          error_message?: string | null
          error_type: string
          id?: string
          row_data: Json
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          error_message?: string | null
          error_type?: string
          id?: string
          row_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "processing_errors_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "processing_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
