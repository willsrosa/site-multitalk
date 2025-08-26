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
  whatsapp?: string;
  role: 'superadmin' | 'affiliate';
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  status: KanbanStatus;
  source?: string;
  value?: number;
  probability?: number;
  expected_close_date?: string;
  last_contact_date?: string;
  next_follow_up?: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  lead_id?: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
  lead?: Lead;
}

export interface Note {
  id: string;
  content: string;
  lead_id?: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
  lead?: Lead;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'whatsapp' | 'other';
  title: string;
  description?: string;
  duration?: number;
  outcome?: string;
  scheduled_at?: string;
  completed_at?: string;
  lead_id?: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
  lead?: Lead;
}

export interface LeadCustomField {
  id: string;
  lead_id: string;
  field_name: string;
  field_value?: string;
  created_at: string;
  updated_at: string;
}
