-- supabase/migrations/20260918_exam_security.sql

CREATE TABLE IF NOT EXISTS quiz_correct_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    correct_answer JSONB NOT NULL,
    answer_type TEXT,
    max_points INT DEFAULT 1,
    UNIQUE(quiz_id, question_id)
);
ALTER TABLE quiz_correct_answers ENABLE ROW LEVEL SECURITY;
-- DENY all from anon/authenticated. Only service_role can read
CREATE POLICY "Deny all client read" ON quiz_correct_answers FOR SELECT USING (false);
CREATE POLICY "Service role all" ON quiz_correct_answers TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS exam_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) NOT NULL,
    quiz_id TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    deadline_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ,
    is_finalized BOOLEAN DEFAULT FALSE,
    server_score INT,
    server_max_score INT,
    server_percentage NUMERIC(5,2),
    ip_address TEXT,
    user_agent TEXT,
    idempotency_key TEXT UNIQUE
);
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student select own session" ON exam_sessions FOR SELECT USING (student_id::text = auth.uid()::text);
-- DENY client INSERT/UPDATE
CREATE POLICY "Deny client insert exam_sessions" ON exam_sessions FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny client update exam_sessions" ON exam_sessions FOR UPDATE USING (false);
CREATE POLICY "Service role all on exam_sessions" ON exam_sessions TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS exam_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    user_answer JSONB,
    time_spent_seconds INT DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;
-- DENY all from client
CREATE POLICY "Deny client all on exam_answers" ON exam_answers FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "Service role all on exam_answers" ON exam_answers TO service_role USING (true) WITH CHECK (true);
