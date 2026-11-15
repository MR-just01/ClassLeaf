export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      notebooks: {
        Row: {
          id: string;
          owner_id: string;
          slug: string;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          slug: string;
          title: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notebooks_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notes: {
        Row: {
          id: string;
          notebook_id: string;
          title: string;
          content: string;
          flags: Json;
          status: 'draft' | 'published';
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          notebook_id: string;
          title: string;
          content?: string;
          flags?: Json;
          status?: 'draft' | 'published';
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          notebook_id?: string;
          title?: string;
          content?: string;
          flags?: Json;
          status?: 'draft' | 'published';
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notes_notebook_id_fkey";
            columns: ["notebook_id"];
            isOneToOne: false;
            referencedRelation: "notebooks";
            referencedColumns: ["id"];
          }
        ];
      };
      images: {
        Row: {
          id: string;
          note_id: string | null;
          storage_path: string;
          order_index: number;
          quality_status: 'passed' | 'flagged' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id?: string | null;
          storage_path: string;
          order_index?: number;
          quality_status?: 'passed' | 'flagged' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string | null;
          storage_path?: string;
          order_index?: number;
          quality_status?: 'passed' | 'flagged' | 'rejected';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "images_note_id_fkey";
            columns: ["note_id"];
            isOneToOne: false;
            referencedRelation: "notes";
            referencedColumns: ["id"];
          }
        ];
      };
      jobs: {
        Row: {
          id: string;
          notebook_id: string;
          note_id: string | null;
          status: 'queued' | 'processing' | 'draft_ready' | 'failed';
          stage: string | null;
          error: string | null;
          log: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          notebook_id: string;
          note_id?: string | null;
          status?: 'queued' | 'processing' | 'draft_ready' | 'failed';
          stage?: string | null;
          error?: string | null;
          log?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          notebook_id?: string;
          note_id?: string | null;
          status?: 'queued' | 'processing' | 'draft_ready' | 'failed';
          stage?: string | null;
          error?: string | null;
          log?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_notebook_id_fkey";
            columns: ["notebook_id"];
            isOneToOne: false;
            referencedRelation: "notebooks";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
