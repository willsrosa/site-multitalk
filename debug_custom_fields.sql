-- Script de Debug para Campos Personalizados
-- Execute este script no SQL Editor do Supabase para diagnosticar problemas

-- 1. Verificar se a tabela lead_custom_fields existe
SELECT 'Verificando se a tabela lead_custom_fields existe...' as status;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name = 'lead_custom_fields';

-- 2. Verificar a estrutura da tabela
SELECT 'Verificando estrutura da tabela...' as status;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'lead_custom_fields' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se RLS está habilitado
SELECT 'Verificando Row Level Security...' as status;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'lead_custom_fields';

-- 4. Verificar políticas RLS
SELECT 'Verificando políticas RLS...' as status;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'lead_custom_fields'
ORDER BY policyname;

-- 5. Verificar índices
SELECT 'Verificando índices...' as status;

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'lead_custom_fields';

-- 6. Verificar permissões
SELECT 'Verificando permissões...' as status;

SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'lead_custom_fields';

-- 7. Testar inserção (descomente para testar)
/*
-- Primeiro, vamos pegar um lead existente para testar
SELECT 'Testando inserção...' as status;

-- Buscar um lead para teste
SELECT id, name FROM leads LIMIT 1;

-- Inserir um campo personalizado de teste (substitua o lead_id pelo ID real)
INSERT INTO lead_custom_fields (
    lead_id, 
    field_name, 
    field_value
) VALUES (
    'SUBSTITUA_PELO_ID_DO_LEAD',
    'Campo Teste',
    'Valor Teste'
);

-- Verificar se foi inserido
SELECT * FROM lead_custom_fields WHERE field_name = 'Campo Teste';
*/

-- 8. Verificar se há dados na tabela
SELECT 'Verificando dados existentes...' as status;

SELECT 
    COUNT(*) as total_campos,
    COUNT(DISTINCT lead_id) as leads_com_campos
FROM lead_custom_fields;

-- 9. Verificar se há leads na tabela
SELECT 'Verificando leads existentes...' as status;

SELECT 
    COUNT(*) as total_leads
FROM leads;

-- 10. Verificar usuário atual e perfil
SELECT 'Verificando usuário atual...' as status;

SELECT 
    auth.uid() as current_user_id,
    (SELECT id FROM profiles WHERE user_id = auth.uid()) as profile_id,
    (SELECT role FROM profiles WHERE user_id = auth.uid()) as user_role;

-- 11. Testar política RLS (descomente para testar)
/*
-- Testar se consegue ver campos personalizados
SELECT 'Testando política RLS...' as status;

SELECT 
    lcf.*,
    l.name as lead_name
FROM lead_custom_fields lcf
JOIN leads l ON l.id = lcf.lead_id
LIMIT 5;
*/

SELECT '🎉 Debug concluído! Verifique os resultados acima.' as resultado;