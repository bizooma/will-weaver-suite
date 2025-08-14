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
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
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
      user_subscriptions: {
        Row: {
          created_at: string
          custom_domain: string | null
          features: Json
          id: string
          plan_type: string
          updated_at: string
          user_id: string
          white_label_enabled: boolean
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          features?: Json
          id?: string
          plan_type?: string
          updated_at?: string
          user_id: string
          white_label_enabled?: boolean
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          features?: Json
          id?: string
          plan_type?: string
          updated_at?: string
          user_id?: string
          white_label_enabled?: boolean
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
    Enums: {},
  },
} as const
