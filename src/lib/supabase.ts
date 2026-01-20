import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string
          address: string
          voter_id: string | null
          latitude: number
          longitude: number
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone: string
          address: string
          voter_id?: string | null
          latitude: number
          longitude: number
          is_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string
          address?: string
          voter_id?: string | null
          latitude?: number
          longitude?: number
          is_verified?: boolean
          created_at?: string
        }
      }
      complaints: {
        Row: {
          id: string
          user_id: string
          category: string
          title: string
          description: string
          location: string
          latitude: number
          longitude: number
          status: string
          priority: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          title: string
          description: string
          location: string
          latitude: number
          longitude: number
          status?: string
          priority?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          title?: string
          description?: string
          location?: string
          latitude?: number
          longitude?: number
          status?: string
          priority?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
