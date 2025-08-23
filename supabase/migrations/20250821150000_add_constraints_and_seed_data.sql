/*
          # [Operation Name]
          Add Unique Constraints and Seed Initial Data

          [This script ensures the database schema is correct for blog functionality and seeds it with essential starting data.]

          ## Query Description: [This operation modifies the 'categories' and 'authors' tables by adding UNIQUE constraints to prevent duplicate entries. It then safely inserts default categories and a default author, which are required for the blog seeding script to run. This is a structural and data-seeding change with low risk.]
          
          ## Metadata:
          - Schema-Category: ["Structural", "Data"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Tables affected: public.categories, public.authors
          - Constraints added: UNIQUE constraint on categories(slug), UNIQUE constraint on authors(name)
          
          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [No]
          - Auth Requirements: [None for this script]
          
          ## Performance Impact:
          - Indexes: [Added (UNIQUE constraints create indexes)]
          - Triggers: [None]
          - Estimated Impact: [Negligible performance impact, improves query performance on constrained columns.]
          */

-- Step 1: Add UNIQUE constraint to category slugs. This is crucial for preventing duplicate categories and for the ON CONFLICT clause to work.
-- The "IF NOT EXISTS" syntax for constraints is not standard, but this query is safe to re-run. If the constraint exists, it will produce a notice, not an error.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'categories_slug_key' AND conrelid = 'public.categories'::regclass
    ) THEN
        ALTER TABLE public.categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
    END IF;
END;
$$;


-- Step 2: Add UNIQUE constraint to author names.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'authors_name_key' AND conrelid = 'public.authors'::regclass
    ) THEN
        ALTER TABLE public.authors ADD CONSTRAINT authors_name_key UNIQUE (name);
    END IF;
END;
$$;


-- Step 3: Insert default categories if they don't exist. Now the ON CONFLICT will work correctly.
INSERT INTO public.categories (name, slug, color) VALUES
('Tecnologia', 'tecnologia', '#3b82f6'),
('Marketing', 'marketing', '#ec4899'),
('Vendas', 'vendas', '#10b981'),
('Inovação', 'inovacao', '#f97316'),
('Atendimento', 'atendimento', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;


-- Step 4: Insert a default author if it doesn't exist.
INSERT INTO public.authors (name, bio, avatar_url) VALUES
('Equipe Multi Talk', 'Especialistas em comunicação e tecnologia na Multi Talk.', 'https://i.pravatar.cc/150?u=multi-talk-team')
ON CONFLICT (name) DO NOTHING;
