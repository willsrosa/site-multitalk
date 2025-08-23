/*
# [Data] Add Default Blog Data
This script inserts default data into the `authors` and `categories` tables. This is necessary for the blog seeding script to function correctly and provides a starting point for content creation.

## Query Description: This operation is safe and only adds new rows. It does not modify or delete any existing data. It populates the blog with initial authors and categories.

## Metadata:
- Schema-Category: "Data"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (can be reversed by deleting the inserted rows)

## Structure Details:
- Inserts into: `authors` table
- Inserts into: `categories` table

## Security Implications:
- RLS Status: Enabled
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible
*/

-- Insert Default Categories
INSERT INTO public.categories (name, slug, description, color) VALUES
('Tecnologia', 'tecnologia', 'Novidades e tendências do mundo da tecnologia.', '#3b82f6'),
('Marketing Digital', 'marketing-digital', 'Estratégias e dicas para marketing online.', '#10b981'),
('Atendimento ao Cliente', 'atendimento-ao-cliente', 'Melhores práticas para um atendimento excepcional.', '#f97316'),
('Inovação', 'inovacao', 'Discussões sobre o futuro dos negócios e da comunicação.', '#8b5cf6'),
('Produtividade', 'produtividade', 'Dicas para otimizar o tempo e os processos da sua equipe.', '#ef4444')
ON CONFLICT (slug) DO NOTHING;

-- Insert Default Author
-- Note: This author is for associating posts with a name. It is NOT an authentication user.
INSERT INTO public.authors (name, bio, avatar_url) VALUES
('Equipe Multi Talk', 'Conteúdo oficial produzido pela equipe da Multi Talk. Trazendo insights e novidades sobre o universo da comunicação omnichannel.', 'https://i.pravatar.cc/150?u=multi-talk-team')
ON CONFLICT (name) DO NOTHING;
