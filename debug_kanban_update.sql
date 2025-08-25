-- Script para debugar o problema de atualização do Kanban
-- Execute este código no Supabase SQL Editor

-- 1. Verificar usuário atual e perfil
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    p.id as profile_id,
    p.username,
    p.role as user_role
FROM profiles p 
WHERE p.user_id = auth.uid();

-- 2. Listar todos os leads do usuário atual
SELECT 
    l.id,
    l.name,
    l.email,
    l.status,
    l.profile_id,
    l.created_at,
    l.updated_at
FROM leads l
JOIN profiles p ON l.profile_id = p.id
WHERE p.user_id = auth.uid()
ORDER BY l.created_at DESC;

-- 3. Testar uma atualização de status (substitua 'LEAD_ID_AQUI' por um ID real)
-- Primeiro, pegue um ID de lead da query acima e substitua abaixo:

-- SELECT 'Testando atualização...' as message;
-- 
-- UPDATE leads 
-- SET 
--     status = 'Em Atendimento',
--     updated_at = NOW()
-- WHERE id = 'LEAD_ID_AQUI'
-- AND profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
-- RETURNING id, name, status, updated_at;

-- 4. Verificar se a atualização funcionou
-- SELECT 
--     l.id,
--     l.name,
--     l.status,
--     l.updated_at
-- FROM leads l
-- JOIN profiles p ON l.profile_id = p.id
-- WHERE p.user_id = auth.uid()
-- AND l.id = 'LEAD_ID_AQUI';

-- 5. Verificar políticas específicas para UPDATE
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'leads' 
AND cmd = 'UPDATE';

-- 6. Testar se o usuário tem permissão de UPDATE
SELECT 
    has_table_privilege(auth.uid()::text, 'leads', 'UPDATE') as has_update_permission,
    has_table_privilege('authenticated', 'leads', 'UPDATE') as authenticated_has_update;

-- 7. Verificar se RLS está bloqueando
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'leads' 
AND schemaname = 'public';