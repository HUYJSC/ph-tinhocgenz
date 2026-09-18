-- supabase/migrations/20260918_certificates_server.sql

CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT UNIQUE NOT NULL,
    student_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    quiz_id TEXT,
    final_score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'valid',
    cert_hash TEXT NOT NULL,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT
);
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
-- Public verify
CREATE POLICY "Public read certificates" ON certificates FOR SELECT USING (true);
-- Deny client insert/update
CREATE POLICY "Deny client insert certificates" ON certificates FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny client update certificates" ON certificates FOR UPDATE USING (false);
CREATE POLICY "Service role all on certificates" ON certificates TO service_role USING (true) WITH CHECK (true);
