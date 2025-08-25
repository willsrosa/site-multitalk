-- Fix RLS Policies - Execute este código para corrigir problemas de acesso

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmins can delete profiles" ON profiles;

DROP POLICY IF EXISTS "Superadmins can view all contacts" ON contacts;
DROP POLICY IF EXISTS "Anyone can insert contacts" ON contacts;

DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Superadmins can view all leads" ON leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Superadmins can update all leads" ON leads;

-- Create simplified policies for profiles
CREATE POLICY "Enable read access for authenticated users" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON profiles
    FOR UPDATE USING (auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin'));

CREATE POLICY "Enable delete for superadmins" ON profiles
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'superadmin')
    );

-- Create simplified policies for leads
CREATE POLICY "Enable read access for authenticated users" ON leads
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for anyone" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON leads
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create simplified policies for contacts
CREATE POLICY "Enable read access for authenticated users" ON contacts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for anyone" ON contacts
    FOR INSERT WITH CHECK (true);

-- Grant permissions to authenticated users
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON leads TO authenticated;
GRANT ALL ON contacts TO authenticated;

-- Grant permissions to anon users for inserts
GRANT INSERT ON leads TO anon;
GRANT INSERT ON contacts TO anon;