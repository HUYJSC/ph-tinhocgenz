-- supabase/migrations/20260918_payments.sql

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    price_vnd INT,
    description TEXT,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE
);
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read plans" ON plans FOR SELECT USING (is_active = true);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    plan_id UUID REFERENCES plans(id),
    amount_vnd INT NOT NULL,
    gateway TEXT DEFAULT 'manual',
    gateway_txn_id TEXT,
    status TEXT DEFAULT 'pending',
    metadata JSONB,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student read own payments" ON payments FOR SELECT USING (student_id::text = auth.uid()::text);
CREATE POLICY "Service role all on payments" ON payments TO service_role USING (true) WITH CHECK (true);
