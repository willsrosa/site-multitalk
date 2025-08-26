-- Script para debugar campos personalizados
-- Execute este script para verificar se os dados estão corretos

-- 1. Verificar se existem leads
SELECT 
    id, 
    name, 
    email,
    created_at
FROM leads 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Verificar se existem campos personalizados
SELECT 
    id,
    lead_id,
    field_name,
    field_value,
    created_at
FROM lead_custom_fields 
ORDER BY created_at DESC;

-- 3. Verificar campos personalizados por lead específico
SELECT 
    l.name as lead_name,
    l.email,
    lcf.field_name,
    lcf.field_value
FROM leads l
LEFT JOIN lead_custom_fields lcf ON l.id = lcf.lead_id
WHERE lcf.id IS NOT NULL
ORDER BY l.created_at DESC;

-- 4. Contar campos personalizados por lead
SELECT 
    l.name as lead_name,
    COUNT(lcf.id) as total_custom_fields
FROM leads l
LEFT JOIN lead_custom_fields lcf ON l.id = lcf.lead_id
GROUP BY l.id, l.name
HAVING COUNT(lcf.id) > 0
ORDER BY total_custom_fields DESC;