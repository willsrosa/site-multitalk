/*
# Blog Management System
Complete blog system with posts, categories, and admin authentication

## Query Description: 
This migration creates a comprehensive blog management system for Multi Talk.
It includes tables for blog posts, categories, authors, and implements Row Level Security (RLS).
Safe operation - creates new tables without affecting existing data.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- posts table: Stores blog articles with SEO metadata
- categories table: Manages post categories
- authors table: Admin user profiles linked to auth.users
- RLS policies: Secure access control

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Supabase Auth integration

## Performance Impact:
- Indexes: Added for performance optimization
- Triggers: None
- Estimated Impact: Minimal
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create authors table (linked to auth.users)
CREATE TABLE authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    meta_keywords TEXT,
    author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured BOOLEAN DEFAULT FALSE,
    read_time INTEGER DEFAULT 5,
    views INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_slug ON posts(slug);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, auth write)
CREATE POLICY "Categories are viewable by everyone" 
ON categories FOR SELECT 
USING (true);

CREATE POLICY "Categories are editable by authenticated users" 
ON categories FOR ALL 
USING (auth.role() = 'authenticated');

-- RLS Policies for authors (public read, own profile write)
CREATE POLICY "Authors are viewable by everyone" 
ON authors FOR SELECT 
USING (true);

CREATE POLICY "Authors can update own profile" 
ON authors FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for posts (public read published, auth manage all)
CREATE POLICY "Published posts are viewable by everyone" 
ON posts FOR SELECT 
USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Posts are editable by authenticated users" 
ON posts FOR ALL 
USING (auth.role() = 'authenticated');

-- Insert default categories
INSERT INTO categories (name, slug, description, color) VALUES
('Tecnologia', 'tecnologia', 'Artigos sobre tecnologia e inovação', '#3B82F6'),
('Marketing', 'marketing', 'Estratégias e dicas de marketing digital', '#10B981'),
('Tendências', 'tendencias', 'Últimas tendências do mercado', '#8B5CF6'),
('IA', 'ia', 'Inteligência Artificial e automação', '#F59E0B'),
('WhatsApp', 'whatsapp', 'Dicas e estratégias para WhatsApp Business', '#25D366');

-- Insert sample posts
INSERT INTO posts (
    title, 
    slug, 
    excerpt, 
    content, 
    featured_image, 
    meta_title,
    meta_description,
    category_id,
    status,
    featured,
    read_time,
    published_at
) VALUES
(
    'O Futuro das Plataformas Omnichannel em 2024',
    'futuro-plataformas-omnichannel-2024',
    'Descubra as principais tendências que estão moldando o cenário das comunicações empresariais e como se preparar para o futuro.',
    'As plataformas omnichannel estão revolucionando a forma como as empresas se comunicam com seus clientes. Em 2024, vemos uma evolução significativa neste setor...',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    'Futuro das Plataformas Omnichannel 2024 | Multi Talk',
    'Descubra as principais tendências das plataformas omnichannel em 2024. Guia completo com insights e estratégias para empresas.',
    (SELECT id FROM categories WHERE slug = 'tendencias'),
    'published',
    true,
    8,
    NOW() - INTERVAL '2 days'
),
(
    'Como Integrar IA no Atendimento ao Cliente',
    'integrar-ia-atendimento-cliente',
    'Um guia completo para implementar chatbots inteligentes que realmente fazem a diferença no atendimento.',
    'A integração de IA no atendimento ao cliente não é mais uma tendência, é uma necessidade. Neste artigo, vamos explorar como implementar essas soluções...',
    'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=600&fit=crop',
    'Como Integrar IA no Atendimento ao Cliente | Multi Talk',
    'Guia completo para implementar IA no atendimento. Aprenda a usar chatbots inteligentes para melhorar a experiência do cliente.',
    (SELECT id FROM categories WHERE slug = 'ia'),
    'published',
    true,
    12,
    NOW() - INTERVAL '5 days'
),
(
    'WhatsApp Business: Maximizando Conversões',
    'whatsapp-business-maximizando-conversoes',
    'Estratégias comprovadas para aumentar suas vendas através do WhatsApp Business API.',
    'O WhatsApp Business API oferece oportunidades incríveis para empresas que querem maximizar suas conversões. Vamos explorar as melhores práticas...',
    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
    'WhatsApp Business: Como Maximizar Conversões | Multi Talk',
    'Estratégias comprovadas para aumentar vendas com WhatsApp Business API. Dicas práticas e casos de sucesso.',
    (SELECT id FROM categories WHERE slug = 'whatsapp'),
    'published',
    false,
    10,
    NOW() - INTERVAL '1 week'
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
