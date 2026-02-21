-- Add email and full_name columns to profiles if they don't already exist
-- This is a safeguard for existing deployments

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT;
