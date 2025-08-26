-- Migration: Add WhatsApp field to profiles table
-- This migration adds a whatsapp field to the profiles table

-- Add whatsapp column to profiles table
ALTER TABLE profiles ADD COLUMN whatsapp TEXT;

-- Create index for whatsapp field
CREATE INDEX idx_profiles_whatsapp ON profiles(whatsapp);

-- Update the updated_at timestamp
UPDATE profiles SET updated_at = NOW() WHERE whatsapp IS NULL;