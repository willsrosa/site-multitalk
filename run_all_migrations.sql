-- Execute all migrations in order
-- Run this in your Supabase SQL Editor

-- Migration 1: Create User and Affiliate System (Fixed Version)
\i migrations/001_create_user_affiliate_system_fixed.sql

-- Migration 2: Create CRM System
\i migrations/002_create_crm_system.sql

-- Migration 3: Add WhatsApp to Profiles
\i migrations/003_add_whatsapp_to_profiles.sql

-- Verify tables were created successfully
SELECT 'profiles' as table_name, count(*) as row_count FROM profiles
UNION ALL
SELECT 'leads' as table_name, count(*) as row_count FROM leads
UNION ALL
SELECT 'contacts' as table_name, count(*) as row_count FROM contacts;