-- ============================================================
-- Migration 004: Staff & Doctor Verification & Seed Tracking
-- ============================================================

-- 1. Add verification fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'APPROVED' 
CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_details JSONB DEFAULT '{}'::jsonb;

-- 2. Add is_seed flag to distinguish seeded demo data from live patient traffic
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT FALSE;

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT FALSE;

ALTER TABLE visits 
ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT FALSE;

ALTER TABLE queue_tickets 
ADD COLUMN IF NOT EXISTS is_seed BOOLEAN DEFAULT FALSE;

-- 3. Add doctor professional credentials to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS license_number TEXT;

ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS qualification TEXT;

ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_is_seed ON queue_tickets(is_seed);
CREATE INDEX IF NOT EXISTS idx_patients_is_seed ON patients(is_seed);

-- 5. Ensure all existing accounts remain APPROVED
UPDATE profiles 
SET verification_status = 'APPROVED' 
WHERE verification_status IS NULL;
