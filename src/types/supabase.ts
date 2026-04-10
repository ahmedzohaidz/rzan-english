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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_type: string | null
          created_at: string | null
          customer_id: string | null
          date: string
          id: string
          notes: string | null
          service_id: string | null
          source: string | null
          status: string | null
          technician_id: string | null
          time: string | null
          vehicle_id: string | null
        }
        Insert: {
          booking_type?: string | null
          created_at?: string | null
          customer_id?: string | null
          date: string
          id?: string
          notes?: string | null
          service_id?: string | null
          source?: string | null
          status?: string | null
          technician_id?: string | null
          time?: string | null
          vehicle_id?: string | null
        }
        Update: {
          booking_type?: string | null
          created_at?: string | null
          customer_id?: string | null
          date?: string
          id?: string
          notes?: string | null
          service_id?: string | null
          source?: string | null
          status?: string | null
          technician_id?: string | null
          time?: string | null
          vehicle_id?: string | null
        }
        Relationships: []
      }
      rzan_missions: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string
          id: string
          mission_date: string
          points_reward: number
          profile_id: string
          title: string
          type: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description: string
          id?: string
          mission_date?: string
          points_reward?: number
          profile_id: string
          title: string
          type: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          mission_date?: string
          points_reward?: number
          profile_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rzan_missions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "rzan_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      rzan_profile: {
        Row: {
          created_at: string
          diagnostic_done: boolean
          id: string
          last_active: string | null
          level: number
          name: string
          points: number
          streak_days: number
        }
        Insert: {
          created_at?: string
          diagnostic_done?: boolean
          id?: string
          last_active?: string | null
          level?: number
          name: string
          points?: number
          streak_days?: number
        }
        Update: {
          created_at?: string
          diagnostic_done?: boolean
          id?: string
          last_active?: string | null
          level?: number
          name?: string
          points?: number
          streak_days?: number
        }
        Relationships: []
      }
      rzan_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          profile_id: string
          session_token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          profile_id: string
          session_token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          profile_id?: string
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "rzan_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "rzan_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      rzan_vocabulary: {
        Row: {
          correct_count: number
          created_at: string
          definition: string
          difficulty: string
          example_sentence: string | null
          id: string
          next_review: string
          profile_id: string
          review_count: number
          word: string
        }
        Insert: {
          correct_count?: number
          created_at?: string
          definition: string
          difficulty?: string
          example_sentence?: string | null
          id?: string
          next_review?: string
          profile_id: string
          review_count?: number
          word: string
        }
        Update: {
          correct_count?: number
          created_at?: string
          definition?: string
          difficulty?: string
          example_sentence?: string | null
          id?: string
          next_review?: string
          profile_id?: string
          review_count?: number
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "rzan_vocabulary_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "rzan_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      rzan_writing_journal: {
        Row: {
          ai_feedback: string | null
          content: string
          created_at: string
          genre: string
          id: string
          points_earned: number
          profile_id: string
          title: string
          updated_at: string
          word_count: number
        }
        Insert: {
          ai_feedback?: string | null
          content?: string
          created_at?: string
          genre: string
          id?: string
          points_earned?: number
          profile_id: string
          title: string
          updated_at?: string
          word_count?: number
        }
        Update: {
          ai_feedback?: string | null
          content?: string
          created_at?: string
          genre?: string
          id?: string
          points_earned?: number
          profile_id?: string
          title?: string
          updated_at?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "rzan_writing_journal_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "rzan_profile"
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
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Update"]

// Convenience row types
export type RzanProfileRow        = Tables<"rzan_profile">
export type RzanSessionRow        = Tables<"rzan_sessions">
export type RzanVocabularyRow     = Tables<"rzan_vocabulary">
export type RzanWritingJournalRow = Tables<"rzan_writing_journal">
export type RzanMissionRow        = Tables<"rzan_missions">
