    -- Script para apagar e recriar as tabelas do sistema CRM
    -- Execute este script no SQL Editor do Supabase

    -- ========================================
    -- FASE 1: REMOÇÃO DAS TABELAS EXISTENTES
    -- ========================================

    -- Remover tabelas CRM na ordem correta (respeitando foreign keys)
    DROP TABLE IF EXISTS lead_custom_fields CASCADE;
    DROP TABLE IF EXISTS activities CASCADE;
    DROP TABLE IF EXISTS notes CASCADE;
    DROP TABLE IF EXISTS tasks CASCADE;
    DROP TABLE IF EXISTS contacts CASCADE;
    DROP TABLE IF EXISTS leads CASCADE;

    -- ========================================
    -- FASE 2: RECRIAÇÃO DAS TABELAS
    -- ========================================

    -- Recriar tabela contacts (para formulários de contato geral)
    CREATE TABLE contacts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT,
        phone TEXT,
        message TEXT NOT NULL,
        source TEXT DEFAULT 'website',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Recriar tabela leads (para leads rastreados por afiliados)
    CREATE TABLE leads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT,
        phone TEXT,
        message TEXT,
        status TEXT DEFAULT 'Nova Lead' CHECK (status IN ('Nova Lead', 'Em Atendimento', 'Reunião', 'Ganho', 'Perca')),
        source TEXT DEFAULT 'website',
        value DECIMAL(10,2),
        probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
        expected_close_date DATE,
        last_contact_date TIMESTAMP WITH TIME ZONE,
        next_follow_up TIMESTAMP WITH TIME ZONE,
        profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Recriar tabela tasks
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

    -- Recriar tabela notes
    CREATE TABLE notes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        content TEXT NOT NULL,
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Recriar tabela activities (logs de chamadas, reuniões, emails, etc.)
    CREATE TABLE activities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'whatsapp', 'other')),
        title TEXT NOT NULL,
        description TEXT,
        duration INTEGER, -- em minutos
        outcome TEXT,
        scheduled_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Recriar tabela lead_custom_fields (campos personalizados flexíveis)
    CREATE TABLE lead_custom_fields (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
        field_name TEXT NOT NULL,
        field_value TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(lead_id, field_name)
    );

    -- ========================================
    -- FASE 3: ÍNDICES PARA PERFORMANCE
    -- ========================================

    -- Índices para contacts
    CREATE INDEX idx_contacts_created_at ON contacts(created_at);
    CREATE INDEX idx_contacts_email ON contacts(email);
    CREATE INDEX idx_contacts_source ON contacts(source);

    -- Índices para leads
    CREATE INDEX idx_leads_profile_id ON leads(profile_id);
    CREATE INDEX idx_leads_status ON leads(status);
    CREATE INDEX idx_leads_created_at ON leads(created_at);
    CREATE INDEX idx_leads_email ON leads(email);
    CREATE INDEX idx_leads_source ON leads(source);
    CREATE INDEX idx_leads_expected_close_date ON leads(expected_close_date);
    CREATE INDEX idx_leads_next_follow_up ON leads(next_follow_up);

    -- Índices para tasks
    CREATE INDEX idx_tasks_profile_id ON tasks(profile_id);
    CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);
    CREATE INDEX idx_tasks_status ON tasks(status);
    CREATE INDEX idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX idx_tasks_priority ON tasks(priority);

    -- Índices para notes
    CREATE INDEX idx_notes_profile_id ON notes(profile_id);
    CREATE INDEX idx_notes_lead_id ON notes(lead_id);
    CREATE INDEX idx_notes_created_at ON notes(created_at);

    -- Índices para activities
    CREATE INDEX idx_activities_profile_id ON activities(profile_id);
    CREATE INDEX idx_activities_lead_id ON activities(lead_id);
    CREATE INDEX idx_activities_type ON activities(type);
    CREATE INDEX idx_activities_scheduled_at ON activities(scheduled_at);
    CREATE INDEX idx_activities_completed_at ON activities(completed_at);

    -- Índices para lead_custom_fields
    CREATE INDEX idx_lead_custom_fields_lead_id ON lead_custom_fields(lead_id);
    CREATE INDEX idx_lead_custom_fields_field_name ON lead_custom_fields(field_name);

    -- ========================================
    -- FASE 4: ROW LEVEL SECURITY (RLS)
    -- ========================================

    -- Habilitar RLS em todas as tabelas
    ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
    ALTER TABLE lead_custom_fields ENABLE ROW LEVEL SECURITY;

    -- ========================================
    -- POLÍTICAS RLS PARA CONTACTS
    -- ========================================

    CREATE POLICY "Superadmins can view all contacts" ON contacts
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE user_id = auth.uid() AND role = 'superadmin'
            )
        );

    CREATE POLICY "Anyone can insert contacts" ON contacts
        FOR INSERT WITH CHECK (true);

    CREATE POLICY "Superadmins can update contacts" ON contacts
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE user_id = auth.uid() AND role = 'superadmin'
            )
        );

    CREATE POLICY "Superadmins can delete contacts" ON contacts
        FOR DELETE USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE user_id = auth.uid() AND role = 'superadmin'
            )
        );

    -- ========================================
    -- POLÍTICAS RLS PARA LEADS
    -- ========================================

    CREATE POLICY "Users can view their own leads" ON leads
        FOR SELECT USING (
            profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
        );

    CREATE POLICY "Anyone can insert leads" ON leads
        FOR INSERT WITH CHECK (true);

    CREATE POLICY "Users can update their own leads" ON leads
        FOR UPDATE USING (
            profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
        );

    CREATE POLICY "Users can delete their own leads" ON leads
        FOR DELETE USING (
            profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
        );

    -- ========================================
    -- POLÍTICAS RLS PARA TASKS
    -- ========================================

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

    -- ========================================
    -- POLÍTICAS RLS PARA NOTES
    -- ========================================

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

    -- ========================================
    -- POLÍTICAS RLS PARA ACTIVITIES
    -- ========================================

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

    -- ========================================
    -- POLÍTICAS RLS PARA LEAD_CUSTOM_FIELDS
    -- ========================================

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

    -- ========================================
    -- FASE 5: TRIGGERS PARA UPDATED_AT
    -- ========================================

    -- Triggers para atualizar updated_at automaticamente
    CREATE TRIGGER update_contacts_updated_at
        BEFORE UPDATE ON contacts
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_leads_updated_at
        BEFORE UPDATE ON leads
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

    -- ========================================
    -- FASE 6: PERMISSÕES
    -- ========================================

    -- Conceder permissões para usuários autenticados
    GRANT ALL ON contacts TO authenticated;
    GRANT ALL ON leads TO authenticated;
    GRANT ALL ON tasks TO authenticated;
    GRANT ALL ON notes TO authenticated;
    GRANT ALL ON activities TO authenticated;
    GRANT ALL ON lead_custom_fields TO authenticated;

    -- ========================================
    -- FASE 7: VERIFICAÇÃO FINAL
    -- ========================================

    -- Verificar se as tabelas foram criadas corretamente
    SELECT 
        schemaname,
        tablename,
        tableowner
    FROM pg_tables 
    WHERE schemaname = 'public' 
        AND tablename IN ('contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields')
    ORDER BY tablename;

    -- Verificar se as políticas RLS foram criadas
    SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd
    FROM pg_policies 
    WHERE schemaname = 'public'
        AND tablename IN ('contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields')
    ORDER BY tablename, policyname;

    -- Verificar se os índices foram criados
    SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
    FROM pg_indexes 
    WHERE schemaname = 'public'
        AND tablename IN ('contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields')
    ORDER BY tablename, indexname;

    -- ========================================
    -- SCRIPT CONCLUÍDO
    -- ========================================

    -- Mensagem de sucesso
    DO $$
    BEGIN
        RAISE NOTICE 'Script executado com sucesso!';
        RAISE NOTICE 'Tabelas recriadas: contacts, leads, tasks, notes, activities, lead_custom_fields';
        RAISE NOTICE 'Todas as políticas RLS, índices e triggers foram configurados.';
    END $$;