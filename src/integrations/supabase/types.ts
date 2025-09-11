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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          landing_page_id: string | null
          message: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          landing_page_id?: string | null
          message?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          landing_page_id?: string | null
          message?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_dishes: {
        Row: {
          created_at: string
          dish_name: string
          id: string
          is_demo: boolean
          profit_range: string
          public_analysis: Json
        }
        Insert: {
          created_at?: string
          dish_name: string
          id?: string
          is_demo?: boolean
          profit_range: string
          public_analysis: Json
        }
        Update: {
          created_at?: string
          dish_name?: string
          id?: string
          is_demo?: boolean
          profit_range?: string
          public_analysis?: Json
        }
        Relationships: []
      }
      dish_analyses: {
        Row: {
          analysis_result: Json
          created_at: string
          dish_name: string
          id: string
          profit_margin: number | null
          suggestions: Json
          updated_at: string
        }
        Insert: {
          analysis_result: Json
          created_at?: string
          dish_name: string
          id?: string
          profit_margin?: number | null
          suggestions?: Json
          updated_at?: string
        }
        Update: {
          analysis_result?: Json
          created_at?: string
          dish_name?: string
          id?: string
          profit_margin?: number | null
          suggestions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      dish_analysis_verifications: {
        Row: {
          access_count: number | null
          created_at: string
          dishes_data: Json
          domain_hash: string | null
          email: string
          email_hash: string | null
          expires_at: string
          id: string
          last_accessed_at: string | null
          updated_at: string
          verification_token: string
          verified_at: string | null
        }
        Insert: {
          access_count?: number | null
          created_at?: string
          dishes_data: Json
          domain_hash?: string | null
          email: string
          email_hash?: string | null
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          updated_at?: string
          verification_token: string
          verified_at?: string | null
        }
        Update: {
          access_count?: number | null
          created_at?: string
          dishes_data?: Json
          domain_hash?: string | null
          email?: string
          email_hash?: string | null
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          updated_at?: string
          verification_token?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      landing_pages: {
        Row: {
          created_at: string
          id: string
          site: string
        }
        Insert: {
          created_at?: string
          id?: string
          site: string
        }
        Update: {
          created_at?: string
          id?: string
          site?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          landing_page_id: string | null
          landing_page_path: string | null
          referrer_url: string | null
          status: string
          updated_at: string
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          landing_page_id?: string | null
          landing_page_path?: string | null
          referrer_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          landing_page_id?: string | null
          landing_page_path?: string | null
          referrer_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_uploads: {
        Row: {
          analysis_results: Json | null
          created_at: string
          id: string
          menu_data: Json
          original_filename: string
          processed_dishes: Json | null
          processing_status: string
          updated_at: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          analysis_results?: Json | null
          created_at?: string
          id?: string
          menu_data: Json
          original_filename: string
          processed_dishes?: Json | null
          processing_status?: string
          updated_at?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          analysis_results?: Json | null
          created_at?: string
          id?: string
          menu_data?: Json
          original_filename?: string
          processed_dishes?: Json | null
          processing_status?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      report_requests: {
        Row: {
          created_at: string
          dishes_data: Json
          email: string
          id: string
          purpose: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dishes_data?: Json
          email: string
          id?: string
          purpose?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dishes_data?: Json
          email?: string
          id?: string
          purpose?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          event_details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      static_content: {
        Row: {
          content_type: string
          created_at: string
          id: string
          last_updated: string | null
          sections: Json
          site_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content_type: string
          created_at?: string
          id?: string
          last_updated?: string | null
          sections?: Json
          site_id?: string
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          id?: string
          last_updated?: string | null
          sections?: Json
          site_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_onboarding_drafts: {
        Row: {
          business_name: string | null
          business_type: string | null
          challenges: string[] | null
          first_name: string | null
          last_name: string | null
          locations_count: number | null
          phone_e164: string | null
          postal_code: string | null
          smart_picks: Json | null
          speciality: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          business_type?: string | null
          challenges?: string[] | null
          first_name?: string | null
          last_name?: string | null
          locations_count?: number | null
          phone_e164?: string | null
          postal_code?: string | null
          smart_picks?: Json | null
          speciality?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          business_type?: string | null
          challenges?: string[] | null
          first_name?: string | null
          last_name?: string | null
          locations_count?: number | null
          phone_e164?: string | null
          postal_code?: string | null
          smart_picks?: Json | null
          speciality?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding_progress: {
        Row: {
          completed_at: string | null
          current_step: number
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          public_email: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          public_email?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          public_email?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          landing_page_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          id?: string
          landing_page_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          landing_page_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_first_touch_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_audit_log: {
        Row: {
          access_ip_hash: string | null
          action: string
          created_at: string | null
          email_hash: string
          id: string
          success: boolean | null
          user_agent_hash: string | null
          verification_id: string | null
        }
        Insert: {
          access_ip_hash?: string | null
          action: string
          created_at?: string | null
          email_hash: string
          id?: string
          success?: boolean | null
          user_agent_hash?: string | null
          verification_id?: string | null
        }
        Update: {
          access_ip_hash?: string | null
          action?: string
          created_at?: string | null
          email_hash?: string
          id?: string
          success?: boolean | null
          user_agent_hash?: string | null
          verification_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_audit_log_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "dish_analysis_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_rate_limits: {
        Row: {
          attempt_count: number | null
          email_hash: string
          first_attempt_at: string | null
          id: string
          ip_hash: string | null
          last_attempt_at: string | null
        }
        Insert: {
          attempt_count?: number | null
          email_hash: string
          first_attempt_at?: string | null
          id?: string
          ip_hash?: string | null
          last_attempt_at?: string | null
        }
        Update: {
          attempt_count?: number | null
          email_hash?: string
          first_attempt_at?: string | null
          id?: string
          ip_hash?: string | null
          last_attempt_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      dish_analyses_demo: {
        Row: {
          created_at: string | null
          dish_name: string | null
          id: string | null
          is_demo: boolean | null
          profit_range: string | null
          public_analysis: Json | null
        }
        Insert: {
          created_at?: string | null
          dish_name?: string | null
          id?: string | null
          is_demo?: boolean | null
          profit_range?: string | null
          public_analysis?: Json | null
        }
        Update: {
          created_at?: string | null
          dish_name?: string | null
          id?: string | null
          is_demo?: boolean | null
          profit_range?: string | null
          public_analysis?: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_enhanced_rate_limit: {
        Args: {
          p_identifier: string
          p_max_attempts?: number
          p_operation?: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_verification_rate_limit: {
        Args: { p_email: string; p_ip_address?: string }
        Returns: boolean
      }
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
      cleanup_expired_verifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_verifications_secure: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_report_request: {
        Args: { p_dishes_data: Json; p_purpose?: string }
        Returns: string
      }
      get_landing_page_analytics: {
        Args: { days_back?: number; min_leads?: number }
        Returns: {
          first_lead_at: string
          landing_page_id: string
          landing_page_slug: string
          last_lead_at: string
          lead_to_onboard_pct: number
          lead_to_signup_pct: number
          leads: number
          onboarded: number
          signup_to_onboard_pct: number
          signups: number
        }[]
      }
      get_public_static_content: {
        Args: { p_content_type?: string; p_site_id?: string }
        Returns: {
          content_type: string
          created_at: string
          id: string
          last_updated: string | null
          sections: Json
          site_id: string
          title: string
          updated_at: string
        }[]
      }
      get_verification_by_token: {
        Args: { p_token: string }
        Returns: {
          access_count: number | null
          created_at: string
          dishes_data: Json
          domain_hash: string | null
          email: string
          email_hash: string | null
          expires_at: string
          id: string
          last_accessed_at: string | null
          updated_at: string
          verification_token: string
          verified_at: string | null
        }[]
      }
      log_security_event: {
        Args: { event_data?: Json; event_type: string }
        Returns: undefined
      }
      log_verification_access: {
        Args: { p_action: string; p_email: string; p_token?: string }
        Returns: undefined
      }
      log_verification_access_enhanced: {
        Args: {
          p_action: string
          p_email: string
          p_ip_address?: string
          p_token?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      migrate_menu_uploads_to_user_ids: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      process_contact_submission: {
        Args: {
          p_email: string
          p_landing_page_id?: string
          p_message?: string
          p_subject?: string
        }
        Returns: string
      }
      process_contact_submission_secure: {
        Args: {
          p_email: string
          p_landing_page_id?: string
          p_message?: string
          p_subject?: string
        }
        Returns: string
      }
      validate_email_domain: {
        Args: { email_address: string }
        Returns: boolean
      }
      validate_verification_access: {
        Args: { p_email?: string; p_token: string }
        Returns: boolean
      }
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
