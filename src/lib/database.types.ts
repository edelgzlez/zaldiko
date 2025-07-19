export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          name: string
          type: 'pension' | 'albergue'
          capacity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'pension' | 'albergue'
          capacity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'pension' | 'albergue'
          capacity?: number
          created_at?: string
          updated_at?: string
        }
      }
      beds: {
        Row: {
          id: string
          room_id: string
          number: number
          type: 'individual' | 'doble' | 'litera_superior' | 'litera_inferior'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          number: number
          type: 'individual' | 'doble' | 'litera_superior' | 'litera_inferior'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          number?: number
          type?: 'individual' | 'doble' | 'litera_superior' | 'litera_inferior'
          created_at?: string
          updated_at?: string
        }
      }
      guests: {
        Row: {
          id: string
          name: string
          last_name: string
          id_number: string
          phone: string
          email: string
          age: number
          country: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          last_name: string
          id_number: string
          phone: string
          email: string
          age: number
          country: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          last_name?: string
          id_number?: string
          phone?: string
          email?: string
          age?: number
          country?: string
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          bed_id: string
          guest_id: string
          check_in: string
          check_out: string
          status: 'confirmed' | 'pending' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bed_id: string
          guest_id: string
          check_in: string
          check_out: string
          status?: 'confirmed' | 'pending' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bed_id?: string
          guest_id?: string
          check_in?: string
          check_out?: string
          status?: 'confirmed' | 'pending' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      room_type: 'pension' | 'albergue'
      bed_type: 'individual' | 'doble' | 'litera_superior' | 'litera_inferior'
      reservation_status: 'confirmed' | 'pending' | 'cancelled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}