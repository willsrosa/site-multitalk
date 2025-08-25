-- Script para testar permissões do Kanban
-- Execute este código no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- 2. Verificar se o perfil existe
SELECT * FROM profiles WHERE user_id = auth.uid();

-- 3. Testar SELECT em leads
SELECT id, name, email, status, profile_id, created_at 
FROM leads 
WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
LIMIT 5;

-- 4. Testar UPDATE em leads (substitua 'LEAD_ID_AQUI' por um ID real)
-- UPDATE leads 
-- SET status = 'Em Atendimento', updated_at = NOW()
-- WHERE id = 'LEAD_ID_AQUI' 
-- AND profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid());

-- 5. Verificar políticas ativas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'leads';

-- 6. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('leads', 'profiles')
AND schemaname = 'public';