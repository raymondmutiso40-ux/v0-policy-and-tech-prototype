-- TFGBV Reporting Portal Database Schema
-- Anchored in Kenya's Data Protection Act, 2019 and Constitution Articles 31, 33, 48

-- Reports table - stores incident reports with anonymity support
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Incident Details
  incident_type TEXT NOT NULL CHECK (incident_type IN (
    'cyber_stalking',
    'online_harassment', 
    'non_consensual_intimate_images',
    'doxxing',
    'identity_theft',
    'sextortion',
    'hate_speech',
    'threats_of_violence',
    'other'
  )),
  incident_description TEXT NOT NULL,
  incident_date DATE,
  platform TEXT, -- e.g., "Facebook", "WhatsApp", "Twitter"
  
  -- Evidence (URLs/descriptions - actual files stored separately)
  evidence_description TEXT,
  evidence_urls TEXT[], -- Array of URLs to evidence
  
  -- Reporter Info (optional for anonymity per Article 31 - Right to Privacy)
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  
  -- Perpetrator Info (if known)
  perpetrator_known BOOLEAN DEFAULT false,
  perpetrator_description TEXT,
  
  -- Case Management
  case_number TEXT UNIQUE,
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted',
    'under_review',
    'investigation',
    'resolved',
    'closed'
  )),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate unique case numbers
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.case_number := 'TFGBV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_case_number
  BEFORE INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION generate_case_number();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS but allow anonymous inserts (for victims who want to report anonymously)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit a report (INSERT)
CREATE POLICY "Anyone can submit reports" ON reports
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only service role can read reports (for admin dashboard)
-- This protects victim data per Data Protection Act 2019
CREATE POLICY "Service role can read reports" ON reports
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Policy: Reporters can view their own reports using case number
-- We'll implement this via API with case number lookup

-- Create index for faster case number lookups
CREATE INDEX idx_reports_case_number ON reports(case_number);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
