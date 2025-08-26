-- Script para executar todas as migrações na ordem correta
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- MIGRAÇÃO 1: Sistema de Usuários e Afiliados
-- ========================================

-- Drop existing tables if they exist (except posts, categories, authors)
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'affiliate' CHECK (role IN ('superadmin', 'affiliate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contacts table (for general contact form submissions)
CREATE TABLE contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table (for affiliate-tracked leads)
CREATE TABLE leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Nova Lead' CHECK (status IN ('Nova Lead', 'Em Atendimento', 'Reunião', 'Ganho', 'Perca')),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_leads_profile_id ON leads(profile_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins can insert profiles" ON profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins can delete profiles" ON profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

-- RLS Policies for contacts
CREATE POLICY "Superadmins can view all contacts" ON contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Anyone can insert contacts" ON contacts
    FOR INSERT WITH CHECK (true);

-- RLS Policies for leads
CREATE POLICY "Users can view their own leads" ON leads
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Superadmins can view all leads" ON leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Anyone can insert leads" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own leads" ON leads
    FOR UPDATE USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Superadmins can update all leads" ON leads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
    INSERT INTO public.profiles (user_id, username, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'affiliate')
    );
    RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- MIGRAÇÃO 2: Sistema CRM Completo
-- ========================================

-- Create tasks table
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table (call logs, meetings, emails, etc.)
CREATE TABLE activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'whatsapp', 'other')),
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER, -- in minutes
    outcome TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lead_custom_fields table for flexible data
CREATE TABLE lead_custom_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    field_name TEXT NOT NULL,
    field_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lead_id, field_name)
);

-- Add more fields to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS value DECIMAL(10,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS expected_close_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_follow_up TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX idx_tasks_profile_id ON tasks(profile_id);
CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

CREATE INDEX idx_notes_profile_id ON notes(profile_id);
CREATE INDEX idx_notes_lead_id ON notes(lead_id);

CREATE INDEX idx_activities_profile_id ON activities(profile_id);
CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_scheduled_at ON activities(scheduled_at);

CREATE INDEX idx_lead_custom_fields_lead_id ON lead_custom_fields(lead_id);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_custom_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (
        profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
    );

CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (
        profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (
        profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
    );

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (
        profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
    );

-- RLS Policies for notes
CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT USING (
        profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
    );

CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT WITH CHECK (
        profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (
        profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
    );

CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE USING (
        profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
    );

-- RLS Policies for activities
CREATE POLICY "Users can view their own activities" ON activities
    FOR SELECT USING (
        profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
    );

CREATE POLICY "Users can insert their own activities" ON activities
    FOR INSERT WITH CHECK (
        profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own activities" ON activities
    FOR UPDATE USING (
        profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
    );

CREATE POLICY "Users can delete their own activities" ON activities
    FOR DELETE USING (
        profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
    );

-- RLS Policies for lead_custom_fields
CREATE POLICY "Users can view custom fields of their leads" ON lead_custom_fields
    FOR SELECT USING (
        lead_id IN (
            SELECT id FROM leads WHERE profile_id = (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
    );

CREATE POLICY "Users can insert custom fields for their leads" ON lead_custom_fields
    FOR INSERT WITH CHECK (
        lead_id IN (
            SELECT id FROM leads WHERE profile_id = (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update custom fields of their leads" ON lead_custom_fields
    FOR UPDATE USING (
        lead_id IN (
            SELECT id FROM leads WHERE profile_id = (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
    );

CREATE POLICY "Users can delete custom fields of their leads" ON lead_custom_fields
    FOR DELETE USING (
        lead_id IN (
            SELECT id FROM leads WHERE profile_id = (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
    );

-- Triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_custom_fields_updated_at
    BEFORE UPDATE ON lead_custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON notes TO authenticated;
GRANT ALL ON activities TO authenticated;
GRANT ALL ON lead_custom_fields TO authenticated;

-- ========================================
-- FINALIZAÇÃO
-- ========================================

-- Verificar se as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields')
ORDER BY tablename;

-- Verificar se as políticas RLS foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;