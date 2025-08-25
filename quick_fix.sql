-- SOLUÇÃO RÁPIDA - Execute este código no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente para testar
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se você tem perfil (substitua pelo seu email)
SELECT * FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- 3. Criar seu perfil de superadmin (substitua user_id pelo ID do passo 2)
INSERT INTO profiles (user_id, username, full_name, role)
VALUES (
    'cole-aqui-o-id-do-usuario',
    'admin',
    'Super Admin',
    'superadmin'
)
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';

-- 4. Testar se funciona sem RLS
SELECT * FROM profiles;
SELECT * FROM leads;

-- 5. Se funcionar, reabilitar RLS com políticas simples
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Políticas simples que funcionam
CREATE POLICY "Allow all for authenticated users" ON profiles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON leads
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON contacts
    FOR ALL USING (auth.role() = 'authenticated');