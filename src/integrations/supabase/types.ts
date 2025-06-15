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
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json
          rate_limit: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json
          rate_limit?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json
          rate_limit?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      api_logs: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          method: string
          request_size: number | null
          response_size: number | null
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          method: string
          request_size?: number | null
          response_size?: number | null
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          method?: string
          request_size?: number | null
          response_size?: number | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      course_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      course_coupons: {
        Row: {
          code: string
          course_id: string | null
          created_at: string | null
          current_uses: number | null
          discount_type: string | null
          discount_value: number | null
          id: string
          max_uses: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          course_id?: string | null
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          max_uses?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          course_id?: string | null
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          max_uses?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_coupons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          amount_paid: number | null
          certificate_issued_at: string | null
          completed_at: string | null
          course_id: string | null
          created_at: string | null
          enrolled_at: string | null
          enrollment_source: string | null
          enrollment_status:
            | Database["public"]["Enums"]["enrollment_status"]
            | null
          external_reference: string | null
          id: string
          installments: number | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          certificate_issued_at?: string | null
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          enrollment_source?: string | null
          enrollment_status?:
            | Database["public"]["Enums"]["enrollment_status"]
            | null
          external_reference?: string | null
          id?: string
          installments?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          certificate_issued_at?: string | null
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          enrollment_source?: string | null
          enrollment_status?:
            | Database["public"]["Enums"]["enrollment_status"]
            | null
          external_reference?: string | null
          id?: string
          installments?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          comment: string | null
          course_id: string | null
          created_at: string | null
          id: string
          rating: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category_id: string | null
          certificate_available: boolean | null
          course_type: Database["public"]["Enums"]["course_type"] | null
          created_at: string
          description: string | null
          discount_price: number | null
          duration_hours: number | null
          id: string
          instructor_id: string | null
          max_installments: number | null
          prerequisites: string | null
          price: number | null
          status: Database["public"]["Enums"]["course_status"] | null
          target_audience: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          certificate_available?: boolean | null
          course_type?: Database["public"]["Enums"]["course_type"] | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string | null
          max_installments?: number | null
          prerequisites?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["course_status"] | null
          target_audience?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          certificate_available?: boolean | null
          course_type?: Database["public"]["Enums"]["course_type"] | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string | null
          max_installments?: number | null
          prerequisites?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["course_status"] | null
          target_audience?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kwify_product_mappings: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          kwify_product_id: string
          product_name: string | null
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kwify_product_id: string
          product_name?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kwify_product_id?: string
          product_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kwify_product_mappings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      professor_permissions: {
        Row: {
          created_at: string | null
          granted: boolean | null
          granted_by: string | null
          id: string
          permission_name: string
          professor_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          granted?: boolean | null
          granted_by?: string | null
          id?: string
          permission_name: string
          professor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          granted?: boolean | null
          granted_by?: string | null
          id?: string
          permission_name?: string
          professor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professor_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professor_permissions_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_login: boolean | null
          id: string
          is_admin: boolean | null
          must_change_password: boolean | null
          name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_login?: boolean | null
          id: string
          is_admin?: boolean | null
          must_change_password?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_login?: boolean | null
          id?: string
          is_admin?: boolean | null
          must_change_password?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: number
          created_at: string
          difficulty: string | null
          explanation: string
          id: string
          options: Json
          question: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          correct_answer: number
          created_at?: string
          difficulty?: string | null
          explanation: string
          id?: string
          options: Json
          question: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          correct_answer?: number
          created_at?: string
          difficulty?: string | null
          explanation?: string
          id?: string
          options?: Json
          question?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          id: string
          level: number
          order_index: number
          parent_topic_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          id?: string
          level?: number
          order_index: number
          parent_topic_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          id?: string
          level?: number
          order_index?: number
          parent_topic_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_parent_topic_id_fkey"
            columns: ["parent_topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_highlights: {
        Row: {
          context_after: string | null
          context_before: string | null
          created_at: string
          highlighted_text: string
          id: string
          note: string | null
          position_end: number
          position_start: number
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context_after?: string | null
          context_before?: string | null
          created_at?: string
          highlighted_text: string
          id?: string
          note?: string | null
          position_end: number
          position_start: number
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context_after?: string | null
          context_before?: string | null
          created_at?: string
          highlighted_text?: string
          id?: string
          note?: string | null
          position_end?: number
          position_start?: number
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_highlights_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          topic_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_question_attempts: {
        Row: {
          attempted_at: string
          id: string
          is_correct: boolean
          question_id: string | null
          selected_answer: number
          user_id: string | null
        }
        Insert: {
          attempted_at?: string
          id?: string
          is_correct: boolean
          question_id?: string | null
          selected_answer: number
          user_id?: string | null
        }
        Update: {
          attempted_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string | null
          selected_answer?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_configs: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          headers: Json | null
          id: string
          is_active: boolean | null
          name: string
          retry_count: number | null
          secret_token: string | null
          timeout_seconds: number | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          retry_count?: number | null
          secret_token?: string | null
          timeout_seconds?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          retry_count?: number | null
          secret_token?: string | null
          timeout_seconds?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          retry_attempt: number | null
          sent_at: string | null
          status_code: number | null
          webhook_config_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          retry_attempt?: number | null
          sent_at?: string | null
          status_code?: number | null
          webhook_config_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          retry_attempt?: number | null
          sent_at?: string | null
          status_code?: number | null
          webhook_config_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_config_id_fkey"
            columns: ["webhook_config_id"]
            isOneToOne: false
            referencedRelation: "webhook_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_queue: {
        Row: {
          created_at: string
          event_type: string
          id: string
          max_retries: number | null
          payload: Json
          retry_count: number | null
          scheduled_for: string | null
          webhook_config_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          max_retries?: number | null
          payload: Json
          retry_count?: number | null
          scheduled_for?: string | null
          webhook_config_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          max_retries?: number | null
          payload?: Json
          retry_count?: number | null
          scheduled_for?: string | null
          webhook_config_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_queue_webhook_config_id_fkey"
            columns: ["webhook_config_id"]
            isOneToOne: false
            referencedRelation: "webhook_configs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_professor_permission: {
        Args: { _user_id: string; _permission: string }
        Returns: boolean
      }
      hash_api_key: {
        Args: { key: string }
        Returns: string
      }
    }
    Enums: {
      course_status: "rascunho" | "ativo" | "pausado" | "encerrado"
      course_type: "online" | "presencial" | "hibrido"
      enrollment_status: "pendente" | "ativo" | "concluido" | "cancelado"
      payment_method: "pix" | "boleto" | "cartao_credito" | "cartao_debito"
      user_role: "admin" | "professor" | "student"
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
      course_status: ["rascunho", "ativo", "pausado", "encerrado"],
      course_type: ["online", "presencial", "hibrido"],
      enrollment_status: ["pendente", "ativo", "concluido", "cancelado"],
      payment_method: ["pix", "boleto", "cartao_credito", "cartao_debito"],
      user_role: ["admin", "professor", "student"],
    },
  },
} as const
