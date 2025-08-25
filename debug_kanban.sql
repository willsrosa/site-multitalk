-- Debug script para testar atualizações no Kanban

-- Verificar se existem leads
SELECT id, name, email, status, profile_id, created_at, updated_at 
FROM leads 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar policies ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'leads';

-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename = 'leads';

-- Testar uma atualização simples
-- UPDATE leads SET status = 'Em Atendimento', updated_at = NOW() WHERE id = 'REPLACE_WITH_ACTUAL_ID';