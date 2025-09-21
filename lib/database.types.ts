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
      campaigns: {
        Row: {
          id: string
          title: string
          description: string
          goal_amount: number
          current_amount: number
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          start_date: string | null
          end_date: string | null
          organization_id: string
          created_by: string
          category: string | null
          image_url: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          goal_amount: number
          current_amount?: number
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          organization_id: string
          created_by: string
          category?: string | null
          image_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          goal_amount?: number
          current_amount?: number
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          organization_id?: string
          created_by?: string
          category?: string | null
          image_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          campaign_id: string
          event_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_intent_id: string | null
          donor_name: string | null
          donor_email: string | null
          is_anonymous: boolean
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          event_id?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_intent_id?: string | null
          donor_name?: string | null
          donor_email?: string | null
          is_anonymous?: boolean
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          event_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_intent_id?: string | null
          donor_name?: string | null
          donor_email?: string | null
          is_anonymous?: boolean
          message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_participants: {
        Row: {
          id: string
          event_id: string
          participant_name: string
          participant_email: string
          participant_phone: string | null
          ticket_quantity: number
          special_requests: string | null
          payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          participant_name: string
          participant_email: string
          participant_phone?: string | null
          ticket_quantity?: number
          special_requests?: string | null
          payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          participant_name?: string
          participant_email?: string
          participant_phone?: string | null
          ticket_quantity?: number
          special_requests?: string | null
          payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          event_type: 'walkathon' | 'auction' | 'product_sale' | 'direct_donation' | 'raffle' | 'other'
          start_date: string
          end_date: string
          location: string
          max_participants: number | null
          current_participants: number
          ticket_price: number
          campaign_id: string | null
          organization_id: string
          created_by: string
          image_url: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          event_type: 'walkathon' | 'auction' | 'product_sale' | 'direct_donation' | 'raffle' | 'other'
          start_date: string
          end_date: string
          location: string
          max_participants?: number | null
          current_participants?: number
          ticket_price?: number
          campaign_id?: string | null
          organization_id: string
          created_by: string
          image_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          event_type?: 'walkathon' | 'auction' | 'product_sale' | 'direct_donation' | 'raffle' | 'other'
          start_date?: string
          end_date?: string
          location?: string
          max_participants?: number | null
          current_participants?: number
          ticket_price?: number
          campaign_id?: string | null
          organization_id?: string
          created_by?: string
          image_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          created_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'parent' | 'teacher' | 'admin'
          organization_id: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'parent' | 'teacher' | 'admin'
          organization_id?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'parent' | 'teacher' | 'admin'
          organization_id?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      volunteer_opportunities: {
        Row: {
          id: string
          title: string
          description: string
          event_id: string | null
          campaign_id: string | null
          required_skills: string[] | null
          time_commitment: string | null
          location: string | null
          max_volunteers: number
          current_volunteers: number
          start_time: string
          end_time: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          event_id?: string | null
          campaign_id?: string | null
          required_skills?: string[] | null
          time_commitment?: string | null
          location?: string | null
          max_volunteers: number
          current_volunteers?: number
          start_time: string
          end_time: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          event_id?: string | null
          campaign_id?: string | null
          required_skills?: string[] | null
          time_commitment?: string | null
          location?: string | null
          max_volunteers?: number
          current_volunteers?: number
          start_time?: string
          end_time?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      volunteer_signups: {
        Row: {
          id: string
          opportunity_id: string
          volunteer_name: string
          volunteer_email: string
          volunteer_phone: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          experience: string | null
          availability: string | null
          notes: string | null
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          signed_up_at: string
          confirmed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          volunteer_name: string
          volunteer_email: string
          volunteer_phone?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          experience?: string | null
          availability?: string | null
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          signed_up_at?: string
          confirmed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          volunteer_name?: string
          volunteer_email?: string
          volunteer_phone?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          experience?: string | null
          availability?: string | null
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          signed_up_at?: string
          confirmed_at?: string | null
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
      campaign_status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
      donation_status: 'pending' | 'completed' | 'failed' | 'refunded'
      event_type: 'walkathon' | 'auction' | 'product_sale' | 'direct_donation' | 'raffle' | 'other'
      user_role: 'parent' | 'teacher' | 'admin'
      volunteer_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
