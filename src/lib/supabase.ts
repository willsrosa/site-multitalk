import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  author_id?: string;
  category_id?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  read_time: number;
  views: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: Author;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  user_id?: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type KanbanStatus = 'Nova Lead' | 'Em Atendimento' | 'Reunião' | 'Ganho' | 'Perca';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: 'superadmin' | 'affiliate';
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  status: KanbanStatus;
  profile_id: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}
