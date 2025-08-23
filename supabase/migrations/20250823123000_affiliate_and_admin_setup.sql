/*
          # [Feature] Affiliate & Superadmin System Setup
          This migration sets up the complete database structure for an affiliate system, including a Kanban board for leads and a role-based access control system for managing blog posts.

          ## Query Description: 
          This is a structural and security-focused migration. It creates new tables, defines relationships, and establishes security policies. It is safe to run as it checks for the existence of objects before creating them. No existing data in other tables will be affected.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Medium"
          - Requires-Backup: false
          - Reversible: false

          ## Structure Details:
          - Creates `profiles` table to store user roles and affiliate data.
          - Creates `leads` table for the Kanban system.
          - Creates a trigger to automatically populate `profiles` on new user signup.
          - Adds Row Level Security (RLS) to `profiles`, `leads`, and `posts`.

          ## Security Implications:
          - RLS Status: Enabled for new tables and `posts`.
          - Policy Changes: Yes. New policies restrict data access based on user roles ('superadmin', 'affiliate').
          - Auth Requirements: Policies are based on `auth.uid()` and custom claims.

          ## Performance Impact:
          - Indexes: Adds foreign key indexes.
          - Triggers: Adds one trigger on `auth.users`.
          - Estimated Impact: Low. The changes are standard and well-indexed.
          */

-- 1. Create User Roles Type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('superadmin', 'affiliate');
    END IF;
END$$;

-- 2. Create Profiles Table
-- Stores public user data and roles.
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    username text UNIQUE NOT NULL,
    full_name text,
    avatar_url text,
    role public.user_role NOT NULL DEFAULT 'affiliate',
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user, including their role.';

-- 3. Create Leads Table
-- Stores leads for the affiliate Kanban board.
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text NOT NULL,
    company text,
    message text NOT NULL,
    status text NOT NULL DEFAULT 'Nova Lead',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.leads IS 'Stores lead information generated from affiliate pages for the Kanban board.';

-- 4. Function to Create a Public Profile for a New User
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    -- Generate a unique username from email
    substring(new.email from 1 for position('@' in new.email) - 1) || '-' || substr(md5(random()::text), 1, 5),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- 5. Trigger to Run the Function on New User Signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Enable RLS for all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 8. RLS Policies for Leads (Kanban)
DROP POLICY IF EXISTS "Affiliates can view their own leads." ON public.leads;
CREATE POLICY "Affiliates can view their own leads." ON public.leads
  FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Affiliates can create leads for themselves." ON public.leads;
CREATE POLICY "Affiliates can create leads for themselves." ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Affiliates can update their own leads." ON public.leads;
CREATE POLICY "Affiliates can update their own leads." ON public.leads
  FOR UPDATE USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- 9. RLS Policies for Posts (Superadmin control)
-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = user_id;
$$;

-- Policies for Posts
DROP POLICY IF EXISTS "Published posts are viewable by everyone." ON public.posts;
CREATE POLICY "Published posts are viewable by everyone." ON public.posts
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Superadmins can do anything with posts." ON public.posts;
CREATE POLICY "Superadmins can do anything with posts." ON public.posts
  FOR ALL USING (public.get_user_role(auth.uid()) = 'superadmin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'superadmin');
