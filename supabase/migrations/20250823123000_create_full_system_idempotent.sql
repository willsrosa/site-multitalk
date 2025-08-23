/*
          # [Full System Setup - Idempotent]
          This script sets up the entire database schema for the Multi Talk application, including the blog, contacts, affiliate system, and Kanban board. It is designed to be idempotent, meaning it can be run multiple times without causing errors. It checks for the existence of each object (type, table, function, policy) before creating it.

          ## Query Description: 
          This operation is structural and foundational. It will:
          1. Create custom data types for user roles and Kanban statuses.
          2. Create all necessary tables: `profiles`, `leads`, `authors`, `categories`, `posts`, `contacts`.
          3. Set up a trigger to automatically create a user profile upon registration.
          4. Implement Row-Level Security (RLS) to protect user data and enforce superadmin privileges for blog management.
          
          This script is safe to run on a new or partially created database. It will not delete any existing data.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: false (requires manual deletion of created objects)

          ## Structure Details:
          - Types: user_role, kanban_status
          - Tables: profiles, authors, categories, posts, contacts, leads
          - Functions: handle_new_user, get_user_role
          - Triggers: on_auth_user_created
          - RLS Policies: Applied to profiles, leads, and posts.

          ## Security Implications:
          - RLS Status: Enabled on critical tables.
          - Policy Changes: Yes, this script defines the core security policies for data access.
          - Auth Requirements: Policies are based on the authenticated user's ID and role.

          ## Performance Impact:
          - Indexes: Primary keys and foreign keys are indexed by default.
          - Triggers: One trigger on user creation, which has a minimal performance impact.
          - Estimated Impact: Low.
          */

-- 1. Create custom types if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('superadmin', 'affiliate');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kanban_status') THEN
    CREATE TYPE public.kanban_status AS ENUM ('Nova Lead', 'Em Atendimento', 'Reunião', 'Ganho', 'Perca');
  END IF;
END$$;

-- 2. Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  username text unique not null,
  full_name text,
  avatar_url text,
  role public.user_role default 'affiliate' not null,
  updated_at timestamptz default now()
);
COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user.';

CREATE TABLE IF NOT EXISTS public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
COMMENT ON TABLE public.authors IS 'Stores author information for blog posts.';

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  color text default '#60a5fa' not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
COMMENT ON TABLE public.categories IS 'Stores blog post categories.';

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  featured_image text,
  meta_title text,
  meta_description text,
  meta_keywords text,
  author_id uuid references public.authors(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  status text default 'draft'::text not null,
  featured boolean default false not null,
  read_time integer,
  views integer default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
COMMENT ON TABLE public.posts IS 'Stores blog posts content and metadata.';

CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  created_at timestamptz default now()
);
COMMENT ON TABLE public.contacts IS 'Stores messages from the contact form.';

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  status public.kanban_status default 'Nova Lead' not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
COMMENT ON TABLE public.leads IS 'Stores leads generated by affiliates for the Kanban board.';

-- 3. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, avatar_url)
  VALUES (
    new.id,
    split_part(new.email, '@', 1) || '-' || substr(md5(random()::text), 1, 6),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile for a new user.';

-- 4. Create trigger to call the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Create helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$;
COMMENT ON FUNCTION public.get_user_role() IS 'Returns the role of the currently authenticated user.';

-- 6. Enable RLS and create policies
-- Profiles Table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Leads Table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Affiliates can manage their own leads." ON public.leads;
CREATE POLICY "Affiliates can manage their own leads." ON public.leads FOR ALL
  USING (profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Posts Table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Posts are public to everyone." ON public.posts;
CREATE POLICY "Posts are public to everyone." ON public.posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Superadmins can manage all posts." ON public.posts;
CREATE POLICY "Superadmins can manage all posts." ON public.posts FOR ALL
  USING (public.get_user_role() = 'superadmin')
  WITH CHECK (public.get_user_role() = 'superadmin');

-- Other tables can remain public or have RLS added as needed
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Authors are public." ON public.authors FOR SELECT USING (true);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Categories are public." ON public.categories FOR SELECT USING (true);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Admins can see contacts." ON public.contacts FOR SELECT USING (public.get_user_role() = 'superadmin');
</sql>
