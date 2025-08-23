/*
          # [Feature] Affiliate & Superadmin System Setup
          This migration sets up the foundational tables for the affiliate system (profiles and leads) and implements a role-based access control system for managing blog posts.

          ## Query Description: 
          This operation creates new tables and adds columns and policies. It is designed to be safe and non-destructive to existing user authentication data. It includes a trigger to automatically create a user profile upon new user sign-up.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Medium"
          - Requires-Backup: false
          - Reversible: true (with manual deletion of tables and policies)

          ## Structure Details:
          - **New Table:** `profiles` (stores user roles like 'affiliate' or 'superadmin')
          - **New Table:** `leads` (stores leads for the affiliate Kanban board)
          - **New Column:** `role` in `profiles` table.
          - **New Policies:** RLS policies for `profiles` and `leads` to ensure data privacy.
          - **New Policies:** RLS policies for `posts` to restrict write access to 'superadmin'.
          - **New Trigger:** `on_auth_user_created` to automate profile creation.

          ## Security Implications:
          - RLS Status: Enabled on all new tables.
          - Policy Changes: Yes, new policies are added to restrict data access based on user roles.
          - Auth Requirements: Policies are tied to authenticated user IDs and roles.

          ## Performance Impact:
          - Indexes: Primary keys and foreign keys are indexed by default.
          - Triggers: One new trigger on `auth.users` table.
          - Estimated Impact: Low performance impact.
          */

-- 1. Create a table for public profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'affiliate' NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

COMMENT ON TABLE public.profiles IS 'Public profile information for each user, including their role.';

-- 2. Create a table for leads
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    company text,
    message text NOT NULL,
    status text DEFAULT 'Nova Lead'::text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.leads IS 'Leads generated for affiliates, managed in the Kanban board.';

-- 3. Set up Row Level Security (RLS)
-- Enable RLS for profiles and leads
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for leads
DROP POLICY IF EXISTS "Affiliates can view their own leads." ON public.leads;
CREATE POLICY "Affiliates can view their own leads." ON public.leads FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = leads.profile_id AND profiles.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Affiliates can update their own leads." ON public.leads;
CREATE POLICY "Affiliates can update their own leads." ON public.leads FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = leads.profile_id AND profiles.user_id = auth.uid()
));

-- Anyone can insert a lead, as it's done via the public contact form.
DROP POLICY IF EXISTS "Anyone can insert a lead." ON public.leads;
CREATE POLICY "Anyone can insert a lead." ON public.leads FOR INSERT WITH CHECK (true);

-- 4. Create a function and trigger to create a profile for each new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Set up RLS for posts table to restrict access to superadmins
-- Make sure RLS is enabled on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Posts are viewable by everyone." ON public.posts;
CREATE POLICY "Posts are viewable by everyone." ON public.posts FOR SELECT USING (true);

-- Function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE profiles.user_id = get_user_role.user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow superadmins to perform all actions on posts
DROP POLICY IF EXISTS "Superadmins can manage all posts." ON public.posts;
CREATE POLICY "Superadmins can manage all posts." ON public.posts
FOR ALL
USING (public.get_user_role(auth.uid()) = 'superadmin')
WITH CHECK (public.get_user_role(auth.uid()) = 'superadmin');
