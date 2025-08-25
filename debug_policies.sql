-- Debug SQL - Execute este código no Supabase SQL Editor para diagnosticar problemas

-- 1. Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'leads', 'contacts');

-- 2. Verificar se há dados na tabela profiles
SELECT COUNT(*) as profile_count FROM profiles;

-- 3. Verificar se há dados na tabela leads
SELECT COUNT(*) as leads_count FROM leads;

-- 4. Verificar o usuário atual
SELECT auth.uid() as current_user_id;

-- 5. Verificar se o perfil do usuário atual existe
SELECT * FROM profiles WHERE user_id = auth.uid();

-- 6. Verificar todas as políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'leads', 'contacts');

-- 7. Temporariamente desabilitar RLS para debug (CUIDADO: só para debug!)
-- Descomente as linhas abaixo APENAS para testar se o problema é RLS
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- 8. Verificar se existem usuários na tabela auth.users
SELECT id, email, created_at FROM auth.users LIMIT 5;