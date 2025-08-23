/*
          # [FEATURE] Affiliate & Kanban System
          This migration sets up the entire database structure for a new affiliate system and a lead management Kanban board.

          ## Query Description: 
          This operation is structural and safe. It renames the 'authors' table to 'profiles' for better scalability, adds a referral code, and creates a new 'leads' table. It also sets up security policies to ensure affiliates can only access their own data. No existing data will be lost.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Medium"
          - Requires-Backup: false
          - Reversible: true (with manual steps)

          ## Structure Details:
          - Renames table `authors` to `profiles`.
          - Adds `referral_code` column to `profiles`.
          - Creates `lead_status` ENUM type.
          - Creates `leads` table with columns: `id`, `profile_id`, `name`, `email`, `phone`, `company`, `status`, `created_at`, `updated_at`.
          
          ## Security Implications:
          - RLS Status: Enabled on `profiles` and `leads`.
          - Policy Changes: Yes. New policies are added to restrict data access per affiliate.
          - Auth Requirements: Policies are based on `auth.uid()`.

          ## Performance Impact:
          - Indexes: Adds a UNIQUE index on `profiles.referral_code`.
          - Triggers: None.
          - Estimated Impact: Low.
          */

-- 1. Create a new ENUM type for lead statuses
CREATE TYPE public.lead_status AS ENUM (
    'new',
    'attending',
    'meeting',
    'won',
    'lost'
);

-- 2. Rename the 'authors' table to 'profiles' to be more generic
ALTER TABLE public.authors RENAME TO profiles;

-- 3. Add a unique referral code to the profiles table
ALTER TABLE public.profiles
ADD COLUMN referral_code TEXT UNIQUE;

-- 4. Backfill referral codes for existing profiles based on their names
-- This ensures existing users can become affiliates immediately.
UPDATE public.profiles
SET referral_code = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE referral_code IS NULL;

-- 5. Make the referral code mandatory for new profiles
ALTER TABLE public.profiles
ALTER COLUMN referral_code SET NOT NULL;

-- 6. Create the 'leads' table
CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    status public.lead_status DEFAULT 'new'::public.lead_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 7. Enable Row Level Security on the new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for 'profiles'
-- Affiliates can see their own profile.
CREATE POLICY "Allow individual read access on profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Affiliates can update their own profile.
CREATE POLICY "Allow individual update access on profiles"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- 9. Create RLS policies for 'leads'
-- Affiliates can see their own leads.
CREATE POLICY "Allow individual read access on leads"
ON public.leads
FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Affiliates can create leads for themselves.
CREATE POLICY "Allow individual insert access on leads"
ON public.leads
FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Affiliates can update their own leads (e.g., change status on Kanban).
CREATE POLICY "Allow individual update access on leads"
ON public.leads
FOR UPDATE
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Affiliates can delete their own leads.
CREATE POLICY "Allow individual delete access on leads"
ON public.leads
FOR DELETE
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Grant usage on the new type to authenticated users
GRANT USAGE ON TYPE public.lead_status TO authenticated;
