-- Fix específico para políticas do Kanban
-- Execute este código no Supabase SQL Editor

-- Remover políticas existentes para leads
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable insert for anyone" ON leads;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Superadmins can view all leads" ON leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Superadmins can update all leads" ON leads;

-- Criar políticas mais específicas e funcionais para leads
CREATE POLICY "leads_select_policy" ON leads
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "leads_insert_policy" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "leads_update_policy" ON leads
    FOR UPDATE USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    ) WITH CHECK (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "leads_delete_policy" ON leads
    FOR DELETE USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );

-- Garantir que as permissões estão corretas
GRANT ALL ON leads TO authenticated;
GRANT INSERT ON leads TO anon;

-- Verificar se as políticas foram criadas
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'leads'
ORDER BY cmd, policyname;