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
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          title: string
          author: string
          isbn: string | null
          publisher: string | null
          publication_year: number | null
          pages: number | null
          language: string
          description: string | null
          cover_url: string | null
          genre: string[] | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          author: string
          isbn?: string | null
          publisher?: string | null
          publication_year?: number | null
          pages?: number | null
          language?: string
          description?: string | null
          cover_url?: string | null
          genre?: string[] | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          author?: string
          isbn?: string | null
          publisher?: string | null
          publication_year?: number | null
          pages?: number | null
          language?: string
          description?: string | null
          cover_url?: string | null
          genre?: string[] | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      user_books: {
        Row: {
          id: string
          user_id: string
          book_id: string
          status: 'reading' | 'read' | 'to_read' | 'wishlist' | 'pal'
          rating: number | null
          started_at: string | null
          finished_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          status: 'reading' | 'read' | 'to_read' | 'wishlist' | 'pal'
          rating?: number | null
          started_at?: string | null
          finished_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          status?: 'reading' | 'read' | 'to_read' | 'wishlist' | 'pal'
          rating?: number | null
          started_at?: string | null
          finished_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          book_id: string
          content: string
          rating: number | null
          is_chronique: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          content: string
          rating?: number | null
          is_chronique?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          content?: string
          rating?: number | null
          is_chronique?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string
          created_at?: string
        }
      }
      forum_topics: {
        Row: {
          id: string
          category_id: string
          user_id: string
          title: string
          content: string
          is_pinned: boolean
          is_locked: boolean
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          user_id: string
          title: string
          content: string
          is_pinned?: boolean
          is_locked?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          user_id?: string
          title?: string
          content?: string
          is_pinned?: boolean
          is_locked?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          topic_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      lists: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      list_items: {
        Row: {
          id: string
          list_id: string
          book_id: string
          position: number | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          list_id: string
          book_id: string
          position?: number | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          book_id?: string
          position?: number | null
          note?: string | null
          created_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          book_id: string | null
          review_id: string | null
          content: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          book_id?: string | null
          review_id?: string | null
          content?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          book_id?: string | null
          review_id?: string | null
          content?: string | null
          created_at?: string
        }
      }
    }
  }
}

