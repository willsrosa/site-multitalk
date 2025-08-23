/*
# [Initial Blog Schema]
This migration sets up the initial database schema for the blog functionality, including tables for posts, categories, and authors. It also establishes relationships between these tables and configures Row Level Security (RLS) for data protection.

## Query Description:
This script creates three new tables: `authors`, `categories`, and `posts`. It will not affect any existing data as it only creates new structures. It is safe to run on a new project. It also creates a function to automatically update the `updated_at` timestamp on row modifications.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the created tables and function)

## Structure Details:
- Tables created: `authors`, `categories`, `posts`
- Columns added: standard columns for a blog system (title, content, author, category, etc.)
- Constraints: Primary Keys, Foreign Keys, NOT NULL constraints.
- Triggers: A trigger is set up to update the `updated_at` column on each table.

## Security Implications:
- RLS Status: Enabled on all three tables.
- Policy Changes: Yes. New policies are created to allow public read access for published content and restricted write access for authenticated users/authors.
- Auth Requirements: Policies are linked to `auth.uid()` and `auth.role()`, integrating with Supabase Authentication.

## Performance Impact:
- Indexes: Primary key indexes are automatically created. Consider adding more indexes on frequently queried columns like `slug` or foreign keys in the future.
- Triggers: A lightweight trigger for `updated_at` is added, with negligible performance impact.
- Estimated Impact: Low. The schema is standard for a blog and should perform well under normal load.
*/

-- 1. Create a function to handle updated_at timestamps
create extension if not exists "moddatetime" with schema "extensions";

-- 2. Create Authors table
create table if not exists public.authors (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade unique,
    name text not null,
    bio text,
    avatar_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
comment on table public.authors is 'Stores author information for blog posts.';

-- Trigger for updated_at on authors
create trigger handle_updated_at before update on public.authors
  for each row execute procedure moddatetime (updated_at);

-- 3. Create Categories table
create table if not exists public.categories (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique,
    slug text not null unique,
    description text,
    color text default '#cccccc',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
comment on table public.categories is 'Stores blog post categories.';

-- Trigger for updated_at on categories
create trigger handle_updated_at before update on public.categories
  for each row execute procedure moddatetime (updated_at);

-- 4. Create Posts table
create table if not exists public.posts (
    id uuid not null primary key default gen_random_uuid(),
    title text not null,
    slug text not null unique,
    excerpt text,
    content text,
    featured_image text,
    meta_title text,
    meta_description text,
    meta_keywords text,
    author_id uuid references public.authors(id) on delete set null,
    category_id uuid references public.categories(id) on delete set null,
    status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
    featured boolean not null default false,
    read_time integer not null default 0,
    views integer not null default 0,
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
comment on table public.posts is 'Stores blog posts.';

-- Trigger for updated_at on posts
create trigger handle_updated_at before update on public.posts
  for each row execute procedure moddatetime (updated_at);

-- 5. Set up Row Level Security (RLS)
-- Enable RLS for all tables
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;

-- Policies for authors table
create policy "Public can read authors" on public.authors for select using (true);
create policy "Users can insert their own author profile" on public.authors for insert with check (auth.uid() = user_id);
create policy "Users can update their own author profile" on public.authors for update using (auth.uid() = user_id);
create policy "Users can delete their own author profile" on public.authors for delete using (auth.uid() = user_id);

-- Policies for categories table
create policy "Public can read categories" on public.categories for select using (true);
create policy "Authenticated users can manage categories" on public.categories for all using (auth.role() = 'authenticated');

-- Policies for posts table
create policy "Public can read published posts" on public.posts for select using (status = 'published');
create policy "Authors can manage their own posts" on public.posts for all using (
  auth.uid() = (select user_id from public.authors where id = posts.author_id)
);

-- 6. Insert some sample data
insert into public.categories (name, slug, description, color) values
('Tendências', 'tendencias', 'Fique por dentro das últimas novidades do mercado.', '#3b82f6'),
('Tecnologia', 'tecnologia', 'Artigos sobre IA, APIs e desenvolvimento.', '#8b5cf6'),
('Marketing', 'marketing', 'Dicas e estratégias para alavancar seu negócio.', '#10b981'),
('Tutoriais', 'tutoriais', 'Guias passo a passo para usar nossa plataforma.', '#f97316');
