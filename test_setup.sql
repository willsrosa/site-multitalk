-- Script de Teste para Verificar a Configuração do Kanban CRM
-- Execute este script após rodar as migrações para testar se tudo está funcionando

-- 1. Verificar se todas as tabelas foram criadas
SELECT 'Verificando tabelas criadas...' as status;

SELECT 
    tablename,
    CASE 
        WHEN tablename IN ('profiles', 'contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields') 
        THEN '✅ OK' 
        ELSE '❌ ERRO' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields')
ORDER BY tablename;

-- 2. Verificar se as colunas foram adicionadas à tabela leads
SELECT 'Verificando colunas da tabela leads...' as status;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se as políticas RLS foram criadas
SELECT 'Verificando políticas RLS...' as status;

SELECT 
    tablename,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields')
GROUP BY tablename
ORDER BY tablename;

-- 4. Verificar se os índices foram criados
SELECT 'Verificando índices...' as status;

SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields')
ORDER BY tablename, indexname;

-- 5. Verificar se as funções foram criadas
SELECT 'Verificando funções...' as status;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name IN ('handle_new_user', 'update_updated_at_column');

-- 6. Verificar se os triggers foram criados
SELECT 'Verificando triggers...' as status;

SELECT 
    event_object_table,
    trigger_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
    AND event_object_table IN ('profiles', 'contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields')
ORDER BY event_object_table, trigger_name;

-- 7. Teste de inserção (opcional - descomente para testar)
/*
-- Inserir um lead de teste
INSERT INTO leads (
    name, 
    email, 
    phone, 
    company, 
    message, 
    status, 
    source, 
    value, 
    probability,
    profile_id
) VALUES (
    'Lead de Teste',
    'teste@exemplo.com',
    '(11) 99999-9999',
    'Empresa Teste',
    'Lead criado para teste do sistema',
    'Nova Lead',
    'website',
    5000.00,
    50,
    (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
);

-- Verificar se o lead foi inserido
SELECT 
    name,
    email,
    status,
    value,
    created_at
FROM leads 
WHERE email = 'teste@exemplo.com';
*/

-- 8. Resumo final
SELECT 'RESUMO FINAL' as status;

SELECT 
    'Tabelas' as tipo,
    COUNT(*) as quantidade
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields')

UNION ALL

SELECT 
    'Políticas RLS' as tipo,
    COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields')

UNION ALL

SELECT 
    'Índices' as tipo,
    COUNT(*) as quantidade
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields')

UNION ALL

SELECT 
    'Funções' as tipo,
    COUNT(*) as quantidade
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name IN ('handle_new_user', 'update_updated_at_column')

UNION ALL

SELECT 
    'Triggers' as tipo,
    COUNT(*) as quantidade
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
    AND event_object_table IN ('profiles', 'contacts', 'leads', 'tasks', 'notes', 'activities', 'lead_custom_fields');

SELECT '🎉 Teste concluído! Verifique os resultados acima.' as resultado;