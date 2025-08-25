-- Teste simples de atualização de leads
-- Execute este código no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
    auth.uid() as user_id,
    auth.role() as role;

-- 2. Verificar perfil
SELECT * FROM profiles WHERE user_id = auth.uid();

-- 3. Listar leads do usuário
SELECT 
    id,
    name,
    status,
    profile_id
FROM leads 
WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
LIMIT 3;

-- 4. Teste de atualização simples
-- IMPORTANTE: Substitua 'SEU_LEAD_ID_AQUI' por um ID real da query acima
/*
UPDATE leads 
SET status = 'Em Atendimento'
WHERE id = 'SEU_LEAD_ID_AQUI'
AND profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid());
*/

-- 5. Verificar se a atualização funcionou
/*
SELECT 
    id,
    name,
    status,
    updated_at
FROM leads 
WHERE id = 'SEU_LEAD_ID_AQUI';
*/