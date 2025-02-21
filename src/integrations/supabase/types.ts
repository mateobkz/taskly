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
      application_tag_relations: {
        Row: {
          application_id: number
          tag_id: number
        }
        Insert: {
          application_id: number
          tag_id: number
        }
        Update: {
          application_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "application_tag_relations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "application_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      application_tags: {
        Row: {
          color: string
          created_at: string | null
          id: number
          name: string
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: number
          name: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: number
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          application_date: string | null
          application_url: string | null
          company_name: string
          contact_person: string | null
          created_at: string | null
          dashboard_id: number | null
          id: number
          last_reminder_sent: string | null
          location: string | null
          next_step: string | null
          notes: string | null
          position: string
          reminder_date: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          application_date?: string | null
          application_url?: string | null
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          dashboard_id?: number | null
          id?: number
          last_reminder_sent?: string | null
          location?: string | null
          next_step?: string | null
          notes?: string | null
          position: string
          reminder_date?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          application_date?: string | null
          application_url?: string | null
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          dashboard_id?: number | null
          id?: number
          last_reminder_sent?: string | null
          location?: string | null
          next_step?: string | null
          notes?: string | null
          position?: string
          reminder_date?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          description: string
          earned_at: string
          icon: string | null
          id: number
          name: string
          user_id: string | null
        }
        Insert: {
          category: string
          description: string
          earned_at?: string
          icon?: string | null
          id?: number
          name: string
          user_id?: string | null
        }
        Update: {
          category?: string
          description?: string
          earned_at?: string
          icon?: string | null
          id?: number
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboards: {
        Row: {
          company_name: string | null
          created_at: string | null
          end_date: string | null
          id: number
          logo_url: string | null
          name: string
          position: string | null
          start_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: number
          logo_url?: string | null
          name: string
          position?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: number
          logo_url?: string | null
          name?: string
          position?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_links: {
        Row: {
          application_id: number | null
          created_at: string
          document_id: number | null
          id: number
          task_id: number | null
        }
        Insert: {
          application_id?: number | null
          created_at?: string
          document_id?: number | null
          id?: number
          task_id?: number | null
        }
        Update: {
          application_id?: number | null
          created_at?: string
          document_id?: number | null
          id?: number
          task_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_links_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_links_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_links_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          description: string | null
          file_path: string
          id: number
          title: string
          updated_at: string
          user_id: string | null
          version: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["document_category"]
          created_at?: string
          description?: string | null
          file_path: string
          id?: number
          title: string
          updated_at?: string
          user_id?: string | null
          version?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          description?: string | null
          file_path?: string
          id?: number
          title?: string
          updated_at?: string
          user_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: number
          status: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: number
          status?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: number
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string
          created_at: string
          current_value: number | null
          end_date: string
          id: number
          last_updated: string | null
          period: string
          progress_data: Json | null
          start_date: string
          target_value: number
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          current_value?: number | null
          end_date: string
          id?: number
          last_updated?: string | null
          period: string
          progress_data?: Json | null
          start_date?: string
          target_value: number
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          current_value?: number | null
          end_date?: string
          id?: number
          last_updated?: string | null
          period?: string
          progress_data?: Json | null
          start_date?: string
          target_value?: number
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_recommendation_feedback: {
        Row: {
          company: string
          created_at: string
          feedback: boolean
          id: number
          role: string
          user_id: string | null
        }
        Insert: {
          company: string
          created_at?: string
          feedback: boolean
          id?: number
          role: string
          user_id?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          feedback?: boolean
          id?: number
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_recommendation_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: number
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          learning_goals: string | null
          position: string | null
          preferred_learning_style: string | null
          skills: string[] | null
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          learning_goals?: string | null
          position?: string | null
          preferred_learning_style?: string | null
          skills?: string[] | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          learning_goals?: string | null
          position?: string | null
          preferred_learning_style?: string | null
          skills?: string[] | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          ai_suggestions: Json | null
          created_at: string
          dashboard_id: number | null
          date_completed: string
          date_ended: string
          date_started: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes: number
          id: number
          is_recurring: boolean | null
          key_insights: string | null
          priority: string | null
          recurrence_end_date: string | null
          recurrence_frequency: string | null
          related_company: string | null
          related_position: string | null
          skills_acquired: string
          status: string | null
          subtasks: Json | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_suggestions?: Json | null
          created_at?: string
          dashboard_id?: number | null
          date_completed: string
          date_ended?: string
          date_started?: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes?: number
          id?: number
          is_recurring?: boolean | null
          key_insights?: string | null
          priority?: string | null
          recurrence_end_date?: string | null
          recurrence_frequency?: string | null
          related_company?: string | null
          related_position?: string | null
          skills_acquired: string
          status?: string | null
          subtasks?: Json | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_suggestions?: Json | null
          created_at?: string
          dashboard_id?: number | null
          date_completed?: string
          date_ended?: string
          date_started?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes?: number
          id?: number
          is_recurring?: boolean | null
          key_insights?: string | null
          priority?: string | null
          recurrence_end_date?: string | null
          recurrence_frequency?: string | null
          related_company?: string | null
          related_position?: string | null
          skills_acquired?: string
          status?: string | null
          subtasks?: Json | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status:
        | "To Apply"
        | "Applied"
        | "Interview"
        | "Offer"
        | "Rejected"
        | "Withdrawn"
      difficulty_level: "Low" | "Medium" | "High"
      document_category:
        | "Resume"
        | "Recommendation Letter"
        | "Motivation Letter"
        | "Certificate"
        | "Other"
      task_priority: "Low" | "Medium" | "High"
      task_status: "Not Started" | "In Progress" | "Completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
