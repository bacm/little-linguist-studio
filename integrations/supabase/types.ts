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
      children: {
        Row: {
          avatar: string
          birthdate: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string
          birthdate: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string
          birthdate?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          achieved: boolean
          achieved_date: string | null
          child_id: string
          created_at: string
          current_value: number
          description: string | null
          icon: string
          id: string
          milestone_type: string
          target_value: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved?: boolean
          achieved_date?: string | null
          child_id: string
          created_at?: string
          current_value?: number
          description?: string | null
          icon?: string
          id?: string
          milestone_type?: string
          target_value?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved?: boolean
          achieved_date?: string | null
          child_id?: string
          created_at?: string
          current_value?: number
          description?: string | null
          icon?: string
          id?: string
          milestone_type?: string
          target_value?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      word_categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      words: {
        Row: {
          category_id: string | null
          child_id: string
          created_at: string
          date_learned: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
          word: string
        }
        Insert: {
          category_id?: string | null
          child_id: string
          created_at?: string
          date_learned?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
          word: string
        }
        Update: {
          category_id?: string | null
          child_id?: string
          created_at?: string
          date_learned?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "words_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "word_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "words_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_milestones_for_child: {
        Args: { child_id: string; user_id: string }
        Returns: undefined
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']