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
      "Base de Dados - Linkedin": {
        Row: {
          Certifications: string | null
          created_at: string
          educacao: string | null
          experiencia: string | null
          headline: string | null
          id: number
          Imagem: string | null
          nome_completo: string | null
          projects: string | null
          sobre: string | null
        }
        Insert: {
          Certifications?: string | null
          created_at?: string
          educacao?: string | null
          experiencia?: string | null
          headline?: string | null
          id?: number
          Imagem?: string | null
          nome_completo?: string | null
          projects?: string | null
          sobre?: string | null
        }
        Update: {
          Certifications?: string | null
          created_at?: string
          educacao?: string | null
          experiencia?: string | null
          headline?: string | null
          id?: number
          Imagem?: string | null
          nome_completo?: string | null
          projects?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      "Linkedin - Base treinada": {
        Row: {
          certifications: string | null
          created_at: string
          education: string | null
          experience: string | null
          feedback_certifications: string | null
          feedback_certifications_number: string | null
          feedback_education: string | null
          feedback_education_number: string | null
          feedback_experience: string | null
          feedback_experience_number: string | null
          feedback_headline: string | null
          feedback_headline_number: string | null
          feedback_projects: string | null
          feedback_projects_number: string | null
          feedback_sobre: string | null
          feedback_sobre_number: string | null
          headline: string | null
          id: number
          nome_completo: string | null
          projects: string | null
          sobre: string | null
        }
        Insert: {
          certifications?: string | null
          created_at?: string
          education?: string | null
          experience?: string | null
          feedback_certifications?: string | null
          feedback_certifications_number?: string | null
          feedback_education?: string | null
          feedback_education_number?: string | null
          feedback_experience?: string | null
          feedback_experience_number?: string | null
          feedback_headline?: string | null
          feedback_headline_number?: string | null
          feedback_projects?: string | null
          feedback_projects_number?: string | null
          feedback_sobre?: string | null
          feedback_sobre_number?: string | null
          headline?: string | null
          id?: number
          nome_completo?: string | null
          projects?: string | null
          sobre?: string | null
        }
        Update: {
          certifications?: string | null
          created_at?: string
          education?: string | null
          experience?: string | null
          feedback_certifications?: string | null
          feedback_certifications_number?: string | null
          feedback_education?: string | null
          feedback_education_number?: string | null
          feedback_experience?: string | null
          feedback_experience_number?: string | null
          feedback_headline?: string | null
          feedback_headline_number?: string | null
          feedback_projects?: string | null
          feedback_projects_number?: string | null
          feedback_sobre?: string | null
          feedback_sobre_number?: string | null
          headline?: string | null
          id?: number
          nome_completo?: string | null
          projects?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      linkedin_links: {
        Row: {
          created_at: string
          id: string
          linkedin_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          linkedin_url: string
        }
        Update: {
          created_at?: string
          id?: string
          linkedin_url?: string
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      user_pdi_data: {
        Row: {
          area_interesse: string
          created_at: string
          email: string
          habilidades: string[]
          id: string
          nome: string
          profissao_desejada: string
          updated_at: string
        }
        Insert: {
          area_interesse: string
          created_at?: string
          email: string
          habilidades?: string[]
          id?: string
          nome: string
          profissao_desejada: string
          updated_at?: string
        }
        Update: {
          area_interesse?: string
          created_at?: string
          email?: string
          habilidades?: string[]
          id?: string
          nome?: string
          profissao_desejada?: string
          updated_at?: string
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
