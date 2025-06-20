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
      cache_metadata: {
        Row: {
          cache_type: string
          created_at: string
          id: string
          is_valid: boolean | null
          last_cache_update: string
          last_webhook_sync: string
          total_records: number | null
          updated_at: string
          webhook_hash: string | null
        }
        Insert: {
          cache_type: string
          created_at?: string
          id?: string
          is_valid?: boolean | null
          last_cache_update?: string
          last_webhook_sync?: string
          total_records?: number | null
          updated_at?: string
          webhook_hash?: string | null
        }
        Update: {
          cache_type?: string
          created_at?: string
          id?: string
          is_valid?: boolean | null
          last_cache_update?: string
          last_webhook_sync?: string
          total_records?: number | null
          updated_at?: string
          webhook_hash?: string | null
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
      leads_cache: {
        Row: {
          created_at: string
          id: string
          leads_count: number
          processed_leads: Json
          raw_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          leads_count?: number
          processed_leads: Json
          raw_data: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          leads_count?: number
          processed_leads?: Json
          raw_data?: Json
          updated_at?: string
        }
        Relationships: []
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
      processing_logs: {
        Row: {
          date_parsing_attempts: Json | null
          error_message: string | null
          error_type: string
          field_analysis: Json | null
          id: string
          raw_row_data: Json
          row_index: number
          timestamp: string
          webhook_raw_data_id: string | null
        }
        Insert: {
          date_parsing_attempts?: Json | null
          error_message?: string | null
          error_type: string
          field_analysis?: Json | null
          id?: string
          raw_row_data: Json
          row_index: number
          timestamp?: string
          webhook_raw_data_id?: string | null
        }
        Update: {
          date_parsing_attempts?: Json | null
          error_message?: string | null
          error_type?: string
          field_analysis?: Json | null
          id?: string
          raw_row_data?: Json
          row_index?: number
          timestamp?: string
          webhook_raw_data_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_logs_webhook_raw_data_id_fkey"
            columns: ["webhook_raw_data_id"]
            isOneToOne: false
            referencedRelation: "webhook_raw_data"
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
      recorrencias_logs: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          log_level: string
          message: string
          session_id: string | null
          source: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          log_level: string
          message: string
          session_id?: string | null
          source: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          log_level?: string
          message?: string
          session_id?: string | null
          source?: string
          timestamp?: string
        }
        Relationships: []
      }
      recorrencias_processed: {
        Row: {
          cliente: string | null
          closer: string | null
          contrato: string
          created_at: string
          data_ultima_atualizacao: string | null
          forma_pagamento: string | null
          id: string
          inicio_contrato: string | null
          nome_produto: string | null
          origem_lead: string | null
          produto_original: string | null
          proximo_vencimento: string | null
          raw_data_id: string | null
          razao_social: string | null
          status: string
          tipo_produto: string | null
          total_em_aberto: number | null
          total_futuro: number | null
          total_pago: number | null
          total_reembolsado: number | null
          ultimo_pagamento: string | null
        }
        Insert: {
          cliente?: string | null
          closer?: string | null
          contrato: string
          created_at?: string
          data_ultima_atualizacao?: string | null
          forma_pagamento?: string | null
          id?: string
          inicio_contrato?: string | null
          nome_produto?: string | null
          origem_lead?: string | null
          produto_original?: string | null
          proximo_vencimento?: string | null
          raw_data_id?: string | null
          razao_social?: string | null
          status: string
          tipo_produto?: string | null
          total_em_aberto?: number | null
          total_futuro?: number | null
          total_pago?: number | null
          total_reembolsado?: number | null
          ultimo_pagamento?: string | null
        }
        Update: {
          cliente?: string | null
          closer?: string | null
          contrato?: string
          created_at?: string
          data_ultima_atualizacao?: string | null
          forma_pagamento?: string | null
          id?: string
          inicio_contrato?: string | null
          nome_produto?: string | null
          origem_lead?: string | null
          produto_original?: string | null
          proximo_vencimento?: string | null
          raw_data_id?: string | null
          razao_social?: string | null
          status?: string
          tipo_produto?: string | null
          total_em_aberto?: number | null
          total_futuro?: number | null
          total_pago?: number | null
          total_reembolsado?: number | null
          ultimo_pagamento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recorrencias_processed_raw_data_id_fkey"
            columns: ["raw_data_id"]
            isOneToOne: false
            referencedRelation: "recorrencias_raw_data"
            referencedColumns: ["id"]
          },
        ]
      }
      recorrencias_processing_logs: {
        Row: {
          date_parsing_attempts: Json | null
          error_message: string | null
          error_type: string
          field_analysis: Json | null
          id: string
          raw_data_id: string | null
          raw_row_data: Json
          row_index: number
          timestamp: string
        }
        Insert: {
          date_parsing_attempts?: Json | null
          error_message?: string | null
          error_type: string
          field_analysis?: Json | null
          id?: string
          raw_data_id?: string | null
          raw_row_data: Json
          row_index: number
          timestamp?: string
        }
        Update: {
          date_parsing_attempts?: Json | null
          error_message?: string | null
          error_type?: string
          field_analysis?: Json | null
          id?: string
          raw_data_id?: string | null
          raw_row_data?: Json
          row_index?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "recorrencias_processing_logs_raw_data_id_fkey"
            columns: ["raw_data_id"]
            isOneToOne: false
            referencedRelation: "recorrencias_raw_data"
            referencedColumns: ["id"]
          },
        ]
      }
      recorrencias_raw_data: {
        Row: {
          created_at: string
          error_details: Json | null
          failed_records: number
          id: string
          processed_records: number
          processing_status: string
          raw_data: Json
          session_id: string | null
          timestamp: string
          total_records: number
        }
        Insert: {
          created_at?: string
          error_details?: Json | null
          failed_records?: number
          id?: string
          processed_records?: number
          processing_status?: string
          raw_data: Json
          session_id?: string | null
          timestamp?: string
          total_records?: number
        }
        Update: {
          created_at?: string
          error_details?: Json | null
          failed_records?: number
          id?: string
          processed_records?: number
          processing_status?: string
          raw_data?: Json
          session_id?: string | null
          timestamp?: string
          total_records?: number
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          log_level: string
          message: string
          session_id: string | null
          source: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          log_level: string
          message: string
          session_id?: string | null
          source: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          log_level?: string
          message?: string
          session_id?: string | null
          source?: string
          timestamp?: string
        }
        Relationships: []
      }
      webhook_raw_data: {
        Row: {
          created_at: string
          error_details: Json | null
          failed_records: number
          id: string
          processed_records: number
          processing_status: string
          raw_data: Json
          session_id: string | null
          timestamp: string
          total_records: number
        }
        Insert: {
          created_at?: string
          error_details?: Json | null
          failed_records?: number
          id?: string
          processed_records?: number
          processing_status?: string
          raw_data: Json
          session_id?: string | null
          timestamp?: string
          total_records?: number
        }
        Update: {
          created_at?: string
          error_details?: Json | null
          failed_records?: number
          id?: string
          processed_records?: number
          processing_status?: string
          raw_data?: Json
          session_id?: string | null
          timestamp?: string
          total_records?: number
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
