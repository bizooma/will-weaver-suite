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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      chatbot_conversations: {
        Row: {
          chatbot_id: string
          conversation_data: Json
          created_at: string
          id: string
          message_count: number
          session_id: string
        }
        Insert: {
          chatbot_id: string
          conversation_data?: Json
          created_at?: string
          id?: string
          message_count?: number
          session_id: string
        }
        Update: {
          chatbot_id?: string
          conversation_data?: Json
          created_at?: string
          id?: string
          message_count?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversations_chatbot_id"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbots: {
        Row: {
          avatar_url: string | null
          calendly_url: string | null
          configuration: Json
          created_at: string
          description: string | null
          embed_code: string | null
          id: string
          is_active: boolean
          name: string
          script_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          calendly_url?: string | null
          configuration?: Json
          created_at?: string
          description?: string | null
          embed_code?: string | null
          id?: string
          is_active?: boolean
          name: string
          script_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          calendly_url?: string | null
          configuration?: Json
          created_at?: string
          description?: string | null
          embed_code?: string | null
          id?: string
          is_active?: boolean
          name?: string
          script_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          background_task_status: string | null
          city: string | null
          created_at: string
          email: string
          email_sent: boolean
          id: string
          ip_address: unknown | null
          law_firm: string | null
          message: string
          name: string
          sheet_synced: boolean
          state: string | null
          subject: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          background_task_status?: string | null
          city?: string | null
          created_at?: string
          email: string
          email_sent?: boolean
          id?: string
          ip_address?: unknown | null
          law_firm?: string | null
          message: string
          name: string
          sheet_synced?: boolean
          state?: string | null
          subject: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          background_task_status?: string | null
          city?: string | null
          created_at?: string
          email?: string
          email_sent?: boolean
          id?: string
          ip_address?: unknown | null
          law_firm?: string | null
          message?: string
          name?: string
          sheet_synced?: boolean
          state?: string | null
          subject?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      marketing_events: {
        Row: {
          content_suggestions: Json
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          event_type: string
          id: string
          is_active: boolean
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          content_suggestions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          event_type: string
          id?: string
          is_active?: boolean
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          content_suggestions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_active?: boolean
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          last_login: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          last_login?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          last_login?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          qr_config: Json
          slug: string
          target_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          qr_config?: Json
          slug: string
          target_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          qr_config?: Json
          slug?: string
          target_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      qr_scans: {
        Row: {
          city: string | null
          country: string | null
          id: string
          ip_address: unknown | null
          qr_code_id: string
          referrer: string | null
          region: string | null
          scanned_at: string
          user_agent: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          id?: string
          ip_address?: unknown | null
          qr_code_id: string
          referrer?: string | null
          region?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          id?: string
          ip_address?: unknown | null
          qr_code_id?: string
          referrer?: string | null
          region?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scans_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_analyses: {
        Row: {
          ai_overview_score: number | null
          analysis_data: Json
          created_at: string
          id: string
          seo_score: number | null
          status: string
          updated_at: string
          url: string
          user_id: string | null
          voice_seo_score: number | null
        }
        Insert: {
          ai_overview_score?: number | null
          analysis_data?: Json
          created_at?: string
          id?: string
          seo_score?: number | null
          status?: string
          updated_at?: string
          url: string
          user_id?: string | null
          voice_seo_score?: number | null
        }
        Update: {
          ai_overview_score?: number | null
          analysis_data?: Json
          created_at?: string
          id?: string
          seo_score?: number | null
          status?: string
          updated_at?: string
          url?: string
          user_id?: string | null
          voice_seo_score?: number | null
        }
        Relationships: []
      }
      system_notifications: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          message: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          message: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          message?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_content: {
        Row: {
          chunk_index: number
          content_chunk: string
          created_at: string
          id: string
          metadata: Json | null
          training_source_id: string
        }
        Insert: {
          chunk_index?: number
          content_chunk: string
          created_at?: string
          id?: string
          metadata?: Json | null
          training_source_id: string
        }
        Update: {
          chunk_index?: number
          content_chunk?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          training_source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_content_training_source_id_fkey"
            columns: ["training_source_id"]
            isOneToOne: false
            referencedRelation: "training_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sources: {
        Row: {
          chatbot_id: string
          created_at: string
          error_message: string | null
          file_name: string | null
          file_path: string | null
          id: string
          source_type: string
          source_url: string | null
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chatbot_id: string
          created_at?: string
          error_message?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          source_type: string
          source_url?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chatbot_id?: string
          created_at?: string
          error_message?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          source_type?: string
          source_url?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sources_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      user_api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          key_name: string
          last_used_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean
          key_name: string
          last_used_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          key_name?: string
          last_used_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          notification_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "system_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          api_access_enabled: boolean
          brand_color: string | null
          company_name: string | null
          created_at: string
          custom_domain: string | null
          hide_branding: boolean
          id: string
          logo_url: string | null
          updated_at: string
          user_id: string
          white_label_enabled: boolean
        }
        Insert: {
          api_access_enabled?: boolean
          brand_color?: string | null
          company_name?: string | null
          created_at?: string
          custom_domain?: string | null
          hide_branding?: boolean
          id?: string
          logo_url?: string | null
          updated_at?: string
          user_id: string
          white_label_enabled?: boolean
        }
        Update: {
          api_access_enabled?: boolean
          brand_color?: string | null
          company_name?: string | null
          created_at?: string
          custom_domain?: string | null
          hide_branding?: boolean
          id?: string
          logo_url?: string | null
          updated_at?: string
          user_id?: string
          white_label_enabled?: boolean
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          custom_domain: string | null
          features: Json
          id: string
          plan_type: string
          purchase_date: string | null
          updated_at: string
          user_id: string
          white_label_enabled: boolean
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          custom_domain?: string | null
          features?: Json
          id?: string
          plan_type?: string
          purchase_date?: string | null
          updated_at?: string
          user_id: string
          white_label_enabled?: boolean
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          custom_domain?: string | null
          features?: Json
          id?: string
          plan_type?: string
          purchase_date?: string | null
          updated_at?: string
          user_id?: string
          white_label_enabled?: boolean
        }
        Relationships: []
      }
      voice_search_analysis: {
        Row: {
          competitive_score: number
          competitor_data: Json
          compliance_issues: Json
          created_at: string
          firm_business_name: string | null
          firm_domain: string | null
          frequency_score: number
          id: string
          optimization_suggestions: Json
          overall_score: number
          presence_score: number
          test_id: string
          updated_at: string
        }
        Insert: {
          competitive_score?: number
          competitor_data?: Json
          compliance_issues?: Json
          created_at?: string
          firm_business_name?: string | null
          firm_domain?: string | null
          frequency_score?: number
          id?: string
          optimization_suggestions?: Json
          overall_score?: number
          presence_score?: number
          test_id: string
          updated_at?: string
        }
        Update: {
          competitive_score?: number
          competitor_data?: Json
          compliance_issues?: Json
          created_at?: string
          firm_business_name?: string | null
          firm_domain?: string | null
          frequency_score?: number
          id?: string
          optimization_suggestions?: Json
          overall_score?: number
          presence_score?: number
          test_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      voice_search_queries: {
        Row: {
          assistant: string
          created_at: string
          id: string
          question: string
          status: string
          test_id: string
        }
        Insert: {
          assistant: string
          created_at?: string
          id?: string
          question: string
          status?: string
          test_id: string
        }
        Update: {
          assistant?: string
          created_at?: string
          id?: string
          question?: string
          status?: string
          test_id?: string
        }
        Relationships: []
      }
      voice_search_reports: {
        Row: {
          created_at: string
          file_path: string | null
          id: string
          report_data: Json
          report_type: string
          test_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          id?: string
          report_data?: Json
          report_type?: string
          test_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string | null
          id?: string
          report_data?: Json
          report_type?: string
          test_id?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_search_results: {
        Row: {
          ai_overview_text: string | null
          assistant: string
          created_at: string
          id: string
          local_pack_results: Json
          query_id: string
          raw_results: Json
          snippets: Json
          source_urls: string[]
          voice_transcript: string | null
        }
        Insert: {
          ai_overview_text?: string | null
          assistant: string
          created_at?: string
          id?: string
          local_pack_results?: Json
          query_id: string
          raw_results?: Json
          snippets?: Json
          source_urls?: string[]
          voice_transcript?: string | null
        }
        Update: {
          ai_overview_text?: string | null
          assistant?: string
          created_at?: string
          id?: string
          local_pack_results?: Json
          query_id?: string
          raw_results?: Json
          snippets?: Json
          source_urls?: string[]
          voice_transcript?: string | null
        }
        Relationships: []
      }
      voice_search_tests: {
        Row: {
          created_at: string
          custom_practice_area: string | null
          id: string
          market_city: string
          market_state: string
          market_zip: string | null
          name: string
          practice_areas: string[]
          selected_assistants: string[]
          settings: Json
          status: string
          test_questions: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_practice_area?: string | null
          id?: string
          market_city: string
          market_state: string
          market_zip?: string | null
          name: string
          practice_areas?: string[]
          selected_assistants?: string[]
          settings?: Json
          status?: string
          test_questions?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_practice_area?: string | null
          id?: string
          market_city?: string
          market_state?: string
          market_zip?: string | null
          name?: string
          practice_areas?: string[]
          selected_assistants?: string[]
          settings?: Json
          status?: string
          test_questions?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_sessions: {
        Row: {
          confidence_scores: Json
          context_questions: string[]
          created_at: string
          extracted_data: Json
          id: string
          is_active: boolean
          session_data: Json
          transcriptions: string[]
          updated_at: string
          user_id: string
          validation_issues: Json
        }
        Insert: {
          confidence_scores?: Json
          context_questions?: string[]
          created_at?: string
          extracted_data?: Json
          id?: string
          is_active?: boolean
          session_data?: Json
          transcriptions?: string[]
          updated_at?: string
          user_id: string
          validation_issues?: Json
        }
        Update: {
          confidence_scores?: Json
          context_questions?: string[]
          created_at?: string
          extracted_data?: Json
          id?: string
          is_active?: boolean
          session_data?: Json
          transcriptions?: string[]
          updated_at?: string
          user_id?: string
          validation_issues?: Json
        }
        Relationships: []
      }
      widget_requests: {
        Row: {
          chatbot_id: string
          created_at: string
          id: string
          ip_address: unknown | null
          origin_domain: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          chatbot_id: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          origin_domain?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          chatbot_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          origin_domain?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      will_drafts: {
        Row: {
          created_at: string
          data: Json
          id: string
          slug: string
          step: number | null
          tone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          slug: string
          step?: number | null
          tone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          slug?: string
          step?: number | null
          tone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_user_with_subscription: {
        Args: { _display_name: string; _email: string; _plan_type: string }
        Returns: Json
      }
      admin_update_created_user: {
        Args: { _auth_user_id: string; _temp_user_id: string }
        Returns: undefined
      }
      admin_update_user_status: {
        Args: { _status: string; _user_id: string }
        Returns: undefined
      }
      assign_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_chatbot_widget_config: {
        Args: { chatbot_id_param: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "free"
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
      app_role: ["admin", "moderator", "user", "free"],
    },
  },
} as const
